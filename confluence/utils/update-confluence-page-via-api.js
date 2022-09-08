import fetch from 'node-fetch'
import fs from 'fs'

const updateConfluencePageViaAPI = async (pageTitle, CONFLUENCE_ACCESS_TOKEN) => {
  const CONFLUENCE_API_BASE_URL = ''
  const CONFLUENCE_PAGE_ID = 0

  const CONFLUENCE_AUTHORIZATION = `Basic ${CONFLUENCE_ACCESS_TOKEN}`

  const getCurrentPageVersionViaAPI = async () => {
    const response = await fetch(
      `${CONFLUENCE_API_BASE_URL}/${CONFLUENCE_PAGE_ID}?expand=body.storage,version`,
      {
        method: 'GET',
        headers: {
          'Authorization': CONFLUENCE_AUTHORIZATION
        }
      })

    const responseBody = await response.json()

    if (!response.ok) {
      const { statusCode, data, message } = responseBody

      throw new Error(`${statusCode} | ${data.authorized} | ${data.valid} | ${message}`)
    }

    return responseBody.version.number
  }

  const getRequestBody = async (pageTitle) => {
    const fileContent = fs.readFileSync('confluence.html', { encoding: 'utf8' })

    const currentPageVersion = await getCurrentPageVersionViaAPI()

    return {
      'id': CONFLUENCE_PAGE_ID,
      'type': 'page',
      'title': pageTitle,
      'space': {
        'key': 'QA'
      },
      'body': {
        'storage': {
          'value': fileContent,
          'representation': 'storage'
        }
      },
      'version': {
        'number': currentPageVersion + 1
      }
    }
  }

  const getFormattedPageTitle = (pageTitle) => {
    const currentDate = new Date().toISOString().split('T')[0]

    return `${pageTitle} | ${currentDate}`
  }

  const formattedPageTitle = getFormattedPageTitle(pageTitle)

  const requestBody = await getRequestBody(formattedPageTitle)

  const response = await fetch(
    `${CONFLUENCE_API_BASE_URL}/${CONFLUENCE_PAGE_ID}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': CONFLUENCE_AUTHORIZATION
      },
      body: JSON.stringify(requestBody)
    }
  )

  const responseBody = await response.json()

  if (!response.ok) {
    const { statusCode, data, message } = responseBody

    throw new Error(`${statusCode} | ${data.authorized} | ${data.valid} | ${message}`)
  }
}

export default updateConfluencePageViaAPI
