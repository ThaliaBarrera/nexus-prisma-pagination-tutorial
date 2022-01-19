import { User, Tweet } from "nexus-prisma";
import { nexusPrisma } from "nexus-plugin-prisma";
import { intArg, makeSchema, objectType, queryType, stringArg, } from "nexus";
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()

export const schema = makeSchema({
    plugins: [nexusPrisma({ experimentalCRUD: true })],
    outputs: {
        schema: __dirname + "/generated/schema.graphql",
        typegen: __dirname + "/generated/nexus.ts",
    },
    types: [
        objectType({
            name: User.$name,
            description: User.$description,
            definition(t) {
                t.field(User.id.name, { ...User.id, type: "Int" });
                t.field(User.email.name, User.email);
                t.field(User.name.name, User.name);
            },
        }),
        objectType({
            name: Tweet.$name,
            description: Tweet.$description,
            definition(t) {
                t.field(Tweet.id.name, { ...Tweet.id, type: "Int" });
                t.field(Tweet.text.name, Tweet.text);
                t.field(Tweet.userId.name, Tweet.userId);
                t.field(Tweet.user.name, Tweet.user);
            },
        }),
        objectType({
            name: "Edge",
            definition(t) {
                t.string("cursor");
                t.field("node", { type: "Tweet" });
            },
        }),
        objectType({
            name: "PageInfo",
            definition(t) {
                t.string("endCursor");
                t.boolean("hasNextPage");
            },
        }),
        objectType({
            name: "Response",
            definition(t) {
                t.field("pageInfo", { type: "PageInfo" });
                t.list.field("edges", { type: "Edge" });
            },
        }),
        queryType({
            definition(t) {
                t.field("tweets", {
                    type: "Response",
                    args: {
                        first: intArg(),
                        after: intArg()
                    },
                    async resolve(_, args, ctx) {
                        let queryResults = null;

                        if (args.after) {
                            queryResults = await ctx.prisma.tweet.findMany({
                                take: args.first,
                                skip: 1,
                                cursor: {
                                    id: args.after,
                                }
                            });
                        }
                        else {
                            queryResults = await ctx.prisma.tweet.findMany({
                                take: args.first,
                            });
                        }
                        if (queryResults.length > 0) {
                            const lastTweetInResults = queryResults[queryResults.length - 1]
                            const myCursor = lastTweetInResults.id

                            const secondQueryResults = await ctx.prisma.tweet.findMany({
                                take: args.first,
                                cursor: {
                                    id: myCursor
                                }
                            });

                            const result = {
                                pageInfo: {
                                    endCursor: myCursor,
                                    hasNextPage: secondQueryResults.length >= args.first,
                                },
                                edges: queryResults.map((Tweet) => ({
                                    cursor: Tweet.id,
                                    node: Tweet,

                                }))
                            };
                            return result
                        }
                        else {
                            const result = {
                                pageInfo: {
                                    endCursor: '',
                                    hasNextPage: false,
                                },
                                edges: []
                            };
                            return result
                        }
                    }
                });
            },
        }),
    ]
})