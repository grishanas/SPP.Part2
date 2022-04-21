import { graphql,buildSchema, GraphQLObjectType, GraphQLString, GraphQLInt } from "graphql";

const TaskType = new GraphQLObjectType({
    name: 'Task',
    fields:{
        TaskName:{type:GraphQLString},
        id:{type:GraphQLInt},
        Status:{type:GraphQLString},
        file:{type:GraphQLString},
        DateTime:{type:GraphQLString}
    }

}) 