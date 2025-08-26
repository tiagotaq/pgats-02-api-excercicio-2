// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');

describe('Testes da resolvers - mutation createTransfer', () => {
    before(async () => {
        const respostaLogin = await request('http://localhost:4000/graphql')
            .post('')
            .send({
                query: `mutation LoginUser($username: String!, $password: String!) {
                            loginUser(username: $username, password: $password) {
                                user {
                                    username
                                }
                                token
                            }
                        }`,
                variables: {
                    username: "julio",
                    password: "123456"
                }
            });
        token = respostaLogin.body.data.loginUser.token;
    })
    it('Deve realizar uma transferência com sucesso', async () => {
        const resposta = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `mutation Mutation($from: String!, $to: String!, $value: Float!) {
                            createTransfer(from: $from, to: $to, value: $value) {
                                from
                                to
                                value
                            }
                        }`,
                variables: {
                    from: "julio",
                    to: "priscila",
                    value: 10.53
                }
            });
        const respostaEsperada = require('../fixture/respostas/graphQlTransferenciaComSucesso.json')
        expect(resposta.body).to.deep.equal(respostaEsperada);
    })
    it('Não deve realizar uma transferência de um valor maior que o saldo do usuário', async () => {
        const resposta = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `mutation Mutation($from: String!, $to: String!, $value: Float!) {
                            createTransfer(from: $from, to: $to, value: $value) {
                                date
                                from
                                to
                                value
                            }
                        }`,
                variables: {
                    from: "julio",
                    to: "priscila",
                    value: 100000
                }
            });
        expect(resposta.body.errors[0].message).to.equal("Saldo insuficiente");
    })
    it('Não deve realizar uma transferência caso não tenha sido informado um token', async () => {
        const resposta = await request('http://localhost:4000/graphql')
            .post('')
            .send({
                query: `mutation Mutation($from: String!, $to: String!, $value: Float!) {
                            createTransfer(from: $from, to: $to, value: $value) {
                                date
                                from
                                to
                                value
                            }
                        }`,
                variables: {
                    from: "julio",
                    to: "priscila",
                    value: 100000
                }
            });
        expect(resposta.body.errors[0].message).to.equal("Autenticação obrigatória");
    })
});

