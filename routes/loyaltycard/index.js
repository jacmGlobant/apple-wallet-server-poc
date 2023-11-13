'use strict';

const generatePkPass = require('../../helpers/pkpass-generator');

module.exports = async function (fastify, opts) {
  fastify.post('/loyaltycard/:accountnumber', async function (request, reply) {
    reply.header('Content-Type', 'application/vnd-apple.pkpass');
    reply.send(await generatePkPass(request.body));
  });
}