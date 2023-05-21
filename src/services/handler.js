// eslint-disable-next-line no-unused-vars
function success(res, data) {
  return res.status(200).json(data)
}

// eslint-disable-next-line no-unused-vars
function error(res, err) {
  return res.status(400).json(err)
}
