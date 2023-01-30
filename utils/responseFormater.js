/* istanbul ignore file */
const successWithData = (h, {
  status,
  data,
  code = 200,
  source = 'db',
}) => {
  const response = h.response({
    status,
    data,
  });

  if (source === 'cache') {
    response.header('X-DATA-SOURCE', 'cache');
  }

  response.code(code);
  return response;
};

const successWithoutData = (h, { status, message, code = 200 }) => h.response({
  status,
  message,
}).code(code);

const fail = (h, response, type) => h.response({
  status: 'fail',
  message:
  type === 'server'
    ? 'Maaf, terjadi kegagalan pada server kami.'
    : response.message,
}).code(type === 'server' ? 500 : response.statusCode || 400);

module.exports = {
  successWithData,
  successWithoutData,
  fail,
};
