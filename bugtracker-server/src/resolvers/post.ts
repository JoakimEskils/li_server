import { Post } from "../entities/Post";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";

@InputType()
class PostInput {
    @Field()
    title: string
    @Field()
    text: string
}

@Resolver()
export class PostResolver {
    async posts(): Promise<Post[]> {
        return Post.find();
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('id') id: number): Promise<Post | null> {
        return Post.findOne({where: {id}});
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() {req}: MyContext
        ): Promise<Post | null> {
        return Post.create({
            ...input, 
            creatorId: req.session.userId
        }).save();
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string,
        ): Promise<Post | null> {
        const post = await Post.findOne({where: {id}});
        if (!post) {
            return null
        }
        if(typeof title !== 'undefined') {
            Post.update({id}, { title });
            }
      
        return post
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,
        ): Promise<boolean> {
        await Post.delete(id); 
        return true;
    }
}
