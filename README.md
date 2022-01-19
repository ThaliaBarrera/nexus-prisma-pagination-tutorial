# Implementing cursor-based pagination with Prisma and GraphQL Nexus

## Introduction

API queries to large databases could provide millions of results. Pagination helps to limit the amount of results, which helps to keep network traffic under control. Therefore, traversing sets of items is a frequent use case in GraphQL.

Let’s evaluate the following two options we have:

-   Use `(first:2 offset:2)` to request the next two items on the list.

-   Use `(first:2 after:$friendCursor)`to retrieve a cursor from the previous item and use it to paginate.

The first alternative is an example of **offset pagination**, whereas the second is an example of **cursor-based pagination**.

Offset pagination and cursor-based pagination are both supported by Prisma Client. Let's have a look at how this is done in Prisma, as well as the benefits and drawbacks of each option.

### Offset pagination

Offset pagination use `skip` and `take` to skip a specific number of results and select only a subset of them.

![](https://imgur.com/jTy0flC.png)

#### Advantages of offset pagination

-   You can go to any page right away. For example, you can skip 200 entries and take 10, simulating a direct jump to page 21 of the result set (the underlying SQL uses `OFFSET`). With cursor-based pagination, this is not possible.

-   The same result set can be paginated in any sort order. You can, for example, navigate to page 21 of a list of User records sorted by first name. Cursor-based pagination, which needs sorting by a unique, sequential column, does not allow for this.


#### Disadvantages of offset pagination

-   At the database level, offset pagination does not scale. If you skip 200,000 records and take the first 10, the database must still traverse the first 200,000 records before giving the 10 you requested.

### Cursor-based pagination

Cursor-based pagination returns a limited set of results before or after a particular cursor by using `cursor` and `take`. A cursor is a unique, sequential column that bookmarks your place in a result set.

![enter image description here](https://imgur.com/MBa3jhq.png)

![enter image description here](https://imgur.com/UOxYcgc.png)

![enter image description here](https://imgur.com/r4gccMp.png)
#### Advantages of cursor-based pagination

-   Cursor-based pagination is scalable. The underlying SQL does not use `OFFSET` and instead searches for all records with an ID larger than the cursor value.


#### Disadvantages of cursor-based pagination

-   Having to the cursor to sort, which must be a distinct, consecutive column.

-   A cursor cannot be used to navigate to a specific page.

This tutorial will use Prisma and GraphQL Nexus to construct cursor-based pagination. To guarantee that this pattern is implemented consistently, we will adhere to the Relay project's [formal definition](https://relay.dev/graphql/connections.htm) for creating GraphQL APIs that use a cursor-based connection pattern.

The Relay specification seeks to provide a way for GraphQL clients to handle [pagination best practices](https://graphql.org/learn/pagination/) consistently while also supporting relevant metadata.

The connection model in the query provides a standard technique for slicing and paginating the result set. The connection model offers a standard way of presenting cursors in the response and a mechanism of informing the client when further results are available.

We will use the following technologies to accomplish the goals mentioned above:
-   SQLite
-   Prisma
-   GraphQL Nexus (nexus-prisma package)
-   Apollo Server.

We will also use two models to demonstrate the concept: **Users** and **Tweets**.

**The ultimate goal is to use cursor-based pagination on a list of tweets. So, let's get started!**

## Tutorial
### This tutorial comprises the following steps

1.  [Configure the project and install dependencies](#step1)

2.  [Create an Apollo server](#step2)

3.  [Initialize Prisma and create schema](#step3)

4.  [Create GraphQL Nexus objects and pagination query](#step4)

5.  [Seed your database with Prisma Studio](#step5)

6.  [Test the pagination!](#step6)

### Prerequisites

-   Node.js installed

### <a name="step1"></a> Configure the project and install dependencies

Start by creating a new directory for your project.

```console
mkdir nexus-prisma-cursor-pagination
cd nexus-prisma-cursor-pagination
```
Then, initialize the project.

```console
npm init -y
```
Now, add the necessary dependencies. You can copy the following code into your `package.json` file. Otherwise, you can install everything using `npm install`

```json
{
	"name": "nexus-prisma-cursor-pagination",
	"version": "1.0.0",
	"description": "",
	"main": "index.js",
	"scripts": {
	"test": "echo \"Error: no test specified\" && exit 1",
	"generate": "npx prisma generate",
	"dev": "ts-node-dev --transpile-only --no-notify src/server.ts",
	"build": "tsc"

	},
	"keywords": [],
	"author": "",
	"license": "ISC",
	"devDependencies": {
	"@types/node": "^17.0.10",
	"ts-node-dev": "^1.1.8",
	"typescript": "^4.5.4"
	},
	"dependencies": {
	"@prisma/client": "^3.8.1",
	"apollo-server": "^3.6.1",
	"graphql": "^15.5.0",
	"nexus": "^1.1.0",
	"nexus-plugin-prisma": "^0.35.0",
	"nexus-prisma": "^0.35.0",
	"prisma": "^3.8.1"
	}
}
```
If you’ll be using Typescript, create a `tsconfig.json` file and add the following.

```json
{
	"compilerOptions": {
	"target": "ES2018",
	"module": "commonjs",
	"lib": ["esnext"],
	"strict": true,
	"rootDir": ".",
	"outDir": "dist",
	"sourceMap": true,
	"esModuleInterop": true
	}
}
```
### <a name="step2"></a> Create an Apollo server

To create the Apollo server, create a `src/server.ts` file that includes the code below.

```typescript
import { ApolloServer } from "apollo-server";
import { appDb } from "./db";
import { schema } from "./schema";

const server = new ApolloServer({
	schema,
	context: () => {
		return {
			prisma: appDb,
		};
	},
});

server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});
```
You’ll notice that we’re missing the db and schema files. Don’t worry, we will get to it later in the tutorial.

### <a name="step3"></a>Initialize Prisma and create schema

Now, it’s time to initialize Prisma along with SQLite. For that, run the following command.

```console
npx prisma init --datasource-provider sqlite
```
You’ll notice that some extra files were created, including the `prisma/schema.prisma`. The [Prisma schema file](https://www.prisma.io/docs/concepts/components/prisma-schema) is the main configuration file for your Prisma setup.

In that file, add a nexusPrisma generator, and then, our first two models: **User** and **Tweet**.

In the end, your file should look like this.

```typescript
generator client {
	provider = "prisma-client-js"
}

datasource db {
	provider = "sqlite"
	url = env("DATABASE_URL")
}

generator nexusPrisma {
	provider = "nexus-prisma"
}

model User {
	id Int @id @default(autoincrement())
	email String @unique
	name String
	tweets Tweet[]
}

model Tweet {
	id Int @id @default(autoincrement())
	text String
	userId Int
	user User @relation(fields: [userId], references: [id])
}
```
You’re now ready to generate your Prisma client.

```console
npm run generate
```
The command above generated the Prisma client, so now you can use it in the code. Create a `src/db.ts` with the following code in it.

```typescript
import { PrismaClient } from '@prisma/client'
export const appDb = new PrismaClient()
```

And you’re ready to do the first Prisma migration!

    npx prisma migrate dev --name initialize

### <a name="step4"></a> Create GraphQL Nexus objects and pagination query

Now, it's time to create your Nexus schema. Go ahead and create a `src/schema.ts` file and add the following.

```typescript
import { User, Tweet } from "nexus-prisma";
import { nexusPrisma } from "nexus-plugin-prisma";
import { makeSchema, objectType, queryType } from "nexus";

export const schema = makeSchema({
	plugins: [nexusPrisma({ experimentalCRUD: true })],
	outputs: {
		schema: __dirname + "/generated/schema.graphql",
		typegen: __dirname + "/generated/nexus.ts",
},
	types: [
		objectType({
			name: User.$name,
			definition(t) {
				t.field(User.id.name, { ...User.id, type: "Int" });
				t.field(User.email.name, User.email);
				t.field(User.name.name, User.name);
				t.field(User.tweets.name, User.tweets);
			},
		}),
		objectType({
			name: Tweet.$name,
			definition(t) {
				t.field(Tweet.id.name, { ...Tweet.id, type: "Int" });
				t.field(Tweet.text.name, Tweet.text);
				t.field(Tweet.userId.name, Tweet.userId);
				t.field(Tweet.user.name, Tweet.user);
			},
		}),
	]
})
```
The above code might seem a little complex, let’s break it down:

 - First, we import `User` and `Tweet`, which are the data models we previously defined in the `prisma/schema.prisma` file.
 - We also import `makeSchema`, `objectType` and `QueryType`, the types we need to implement.
 - Then, inside a `makeSchema`, we declare two object types, `User` and `Tweet`, with all the fields we have defined in the Prisma schema.

Now, it’s time to build the cursor-pagination query. But before that, we need 3 more object types: `Edge`, `PageInfo`, and `Response`. These are helper objects to implement the pagination following the [Relay spec](https://relay.dev/graphql/connections.htm).

Add them after the `User` and `Tweet` object types.

``` typescript
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
```
And the `queryType` we need to query the tweets, which implements all the cursor-based pagination logic!

```typescript
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
```
The above query implements a field called `tweets` that receives 2 arguments: `first` and `after`. Inside the `resolve()` we construct the response:

 - The response depends, of course, on the arguments that are passed to the query: if there’s no `after` (which means no cursor is passed) then the first *n* tweets are returned.
 - If there’s indeed a cursor, we pass that to the `findMany()` and return the requested subset of tweets.
 - Lastly, if there are no elements in the response, meaning there are no tweets, we return a response with empty fields.

### <a name="step5"></a> Fill your database with Prisma Studio

Before testing that our cursor-based pagination is working, we need to add some users and tweets to our database. The easiest way to do this is in Prisma Studio.

To launch Prisma Studio, all you need to do is run the following.

    npx prisma studio

The above command will automatically open Prisma Studio in your browser. Then, you can start by adding a few **Users**, and then some **Tweets**.

![enter image description here](https://i.imgur.com/9YWZUOg.png)

![enter image description here](https://i.imgur.com/YKGyFdL.png)

### <a name="step6"></a> Test the pagination!

Finally, we’re ready to test the cursor-based pagination. To do that, launch the Apollo server.

    npm run dev

If everything goes well, you should see the following message:

> 🚀 Server ready at [http://localhost:4000/](http://localhost:4000/)

Go to that address on your browser to open the GraphQL playground tool.

In the Explorer section, you’ll see the tweets **query** we created, along with its **arguments** and **fields**.

To test the pagination, I ran the first query with `first: 3`, and `after: null`. Assuming that in the first query call we don’t have a cursor to pass yet.

Then, I noted the `endCursor`, which in this case is 7 and ran a second query with `first: 3`, and `after: 7`, to get the next 3 tweets.

![enter image description here](https://i.imgur.com/SszDjB6.png)

![enter image description here](https://i.imgur.com/HzK4W1N.png)
Now, you can use this approach to traverse long lists, passing the `endCursor` to the next call, until `hasNextPage` is `false` (as in my case).

That's it! You've implemented cursor-based pagination with Nexus and Prisma.