/* eslint-disable prettier/prettier */
import { Post, User } from '.prisma/client';
import { ApolloServer } from 'apollo-server';
import { DateTimeResolver } from 'graphql-scalars';
import { Context, context } from './context';

const typeDefs = `
type Query {
  allUsers: [User!]!
  postById(id: Int!): Post
  feed(searchString: String, skip: Int, take: Int): [Post!]!
  draftsByUser(id: Int!): [Post]
}
type Mutation {
  signupUser(name: String, email: String!): User!
  createDraft(title: String!, content: String, authorEmail: String): Post
  incrementPostViewCount(id: Int!): Post
  deletePost(id: Int!): Post
}
type User {
  id: Int!
  email: String!
  name: String
  posts: [Post!]!
}
type Post {
  id: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
  title: String!
  content: String
  published: Boolean!
  viewCount: Int!
  author: User
}
scalar DateTime
`;

const resolvers = {
  Query: {
    allUsers: (_parent: any, _args: any, context: Context) => {
      return context.prisma.user.findMany({});
    },
    postById: (_parent: any, _args: { id: number }, context: Context) => {
      return context.prisma.post.findUnique({
        where: {
          id: _args.id
        }
      });
    },
    feed: (
      _parent: any,
      _args: {
        searchString: string | undefined;
        skip: number | undefined;
        take: number | undefined;
      },
      context: Context
    ) => {
      const or = _args.searchString
        ? {
          OR: [
            { title: { contains: _args.searchString as string } },
            { content: { contains: _args.searchString as string } }
          ]
        }
        : {};

      return context.prisma.post.findMany({
        where: {
          published: true,
          ...or
        },
        skip: Number(_args.skip) || undefined,
        take: Number(_args.take) || undefined
      });
    },
    draftsByUser: (_parent: any, _args: { id: number }, context: Context) => {
      return context.prisma.user.findUnique({
        where: {
          id: _args.id,
        }
      }).posts({
        where: {
          published: false
        }
      });
      
    }
  },
  Mutation: {
    signupUser: (_parent: any, _args: { name: string | undefined; email: string }, context: Context) => {
      return context.prisma.user.create({
        data: {
          email: _args.name as string,
          name: _args.email
        }
      });
    },
    createDraft: (
      _parent: any,
      _args: { title: string; content: string | undefined; authorEmail: string },
      context: Context
    ) => {
      return context.prisma.post.create({
        data: {
          title: _args.title,
          content: _args.content,
          author: {
            connect: {
              email: _args.authorEmail
            }
          }
        }
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    incrementPostViewCount: (_parent: any, _args: { id: number }, context: Context) => {
      // TODO
    },
    deletePost: (_parent: any, _args: { id: number }, context: Context) => {
      return context.prisma.post.delete({
        where: { 
          id: _args.id
        }
      });
    }
  },
  Post: {
    author: (parent: Post, _args: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: {
          id: Number(parent.authorId)
        }
      });
    }
  },
  User: {
    posts: (parent: User, _args: any, context: Context) => {
      return context.prisma.post.findMany({
        where: {
          authorId: parent.id
        }
      });
    }
  },
  DateTime: DateTimeResolver
};

const server = new ApolloServer({ typeDefs, resolvers, context });
server.listen({ port: 4000 }, () => console.log('🚀 Server ready at: http://localhost:4000'));
