import * as core from '@actions/core'
import generateHTMLFileWithTestNames from './utils/generate-html-file.js'
import updateConfluencePageViaAPI from './utils/update-confluence-page-via-api.js'

const CONFLUENCE_ACCESS_TOKEN = core.getInput('confluence-access-token')

const updateConfluencePage = async (fileName, pageTitle) => {
  generateHTMLFileWithTestNames(fileName)

  await updateConfluencePageViaAPI(pageTitle, CONFLUENCE_ACCESS_TOKEN)
}

updateConfluencePage('confluence.html', 'Automatic E2E Tests')
