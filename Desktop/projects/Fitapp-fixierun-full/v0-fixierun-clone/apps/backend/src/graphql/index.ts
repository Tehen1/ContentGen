import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';

export const setupGraphQL = async (app: Express): Promise<void> => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    introspection: process.env.NODE_ENV !== 'production',
    playground: process.env.NODE_ENV !== 'production',
  });

  await server.start();
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true
    }
  });

  console.log('✅ GraphQL server setup complete');
};