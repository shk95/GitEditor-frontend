// eslint-disable-next-line no-unused-vars
const RESPONSE_STATE = {}
// eslint-disable-next-line no-unused-vars
function responseParser(response) {
  switch (response.state) {
    case 200:
      return response.data
    case 401:
      return response.data
  }
  return response.data
}
