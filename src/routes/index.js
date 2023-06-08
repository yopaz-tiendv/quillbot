const express = require('express')
const router = express.Router()
const puppeteerExtra = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteerExtra.use(StealthPlugin())
const { executablePath } = require('puppeteer')

const MAX_RECURSIVE_COUNT = 5
const QUILL_BOT_URL = 'https://quillbot.com/'
const TEXT_REQUIRED_ERROR = { error: 'text is required' }
const GET_DATA_ERROR = { error: 'Cannot get data' }
const SUCCESS_STATUS_CODE = 200
const NOT_FOUND_STATUS_CODE = 404

router.post('/quillbot/rephrase', async (req, res, next) => {
    const text = req?.body?.text
    if (!text) res.status(NOT_FOUND_STATUS_CODE).json(TEXT_REQUIRED_ERROR)
    else {
        let recursiveCount = 0
        const getData = async (text) => {
            console.log('recursiveCount', recursiveCount)
            try {
                const browser = await puppeteerExtra.launch({
                        executablePath: executablePath(),
                        waitForInitialPage: true,
                    },
                )
                const page = await browser.newPage()
                await page.goto(QUILL_BOT_URL)
                await page.setViewport({ width: 1080, height: 1024 })

                await page.type('#paraphraser-input-box', text)

                await page.screenshot({ path: 'page.png' })

                const paraphraseButton = await page.waitForSelector(
                    '.quillArticleBtn')
                await paraphraseButton.click()

                // wait for result
                await page.waitForSelector('.css-1fz2g01')

                const outputBoxSelector = await page.waitForSelector(
                    '#paraphraser-output-box')
                const result = await outputBoxSelector?.evaluate(
                    el => el.textContent,
                )

                await page.screenshot({ path: 'output_page.png' })

                await browser.close()

                if (result) return { data: result }

                // use recursion when we have empty data
                if (recursiveCount >
                    MAX_RECURSIVE_COUNT) return GET_DATA_ERROR
                recursiveCount++
                return getData(text)
            } catch (e) {
                if (recursiveCount >
                    MAX_RECURSIVE_COUNT) return GET_DATA_ERROR
                recursiveCount++
                return getData(text)
            }
        }

        const result = await getData(text)
        res.status(result.data ? SUCCESS_STATUS_CODE : NOT_FOUND_STATUS_CODE).
            json(result)
    }
})

module.exports = router
