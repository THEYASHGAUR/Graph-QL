import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import bodyParser from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import axios from 'axios';

async function startServer() {
    const app = express();
    const server = new ApolloServer({
        typeDefs: `
            type User{
                id: ID!
                name: String!
                username: String!
                email: String!
                
            }
            type Todo{
                id: ID!
                title: String!
                completed: Boolean
                user: User
            }
            type Query{
                getTodos: [Todo]
                getAllUsers: [User]
                getUser(id: ID): User
                
            }
        `,
        resolvers: {
            Todo: {
                user: async (todo) =>(
                    (await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`)).data
                )
            },
            Query: {
                getTodos: async () =>
                    (await axios.get('https://jsonplaceholder.typicode.com/todos')).data,
                getAllUsers: async () =>
                    (await axios.get('https://jsonplaceholder.typicode.com/users')).data,
                getUser: async (parent, {id}) =>
                    (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data
            }
        },
    });

    await server.start();

    app.use(bodyParser.json());
    app.use(cors());

    app.use('/graphql', expressMiddleware(server));
    app.listen(8000, () => {
        console.log("server started on the port 8000");
    })
}

startServer();