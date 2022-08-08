import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import dotenv from 'dotenv'

dotenv.config()

@InputType() // inputtypes we use for arguments
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
    @Field()
    email: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType() //objecttypes we can return
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => User, {nullable: true})
    async me(
        @Ctx() { req }: MyContext
    ) {
        // not logged in
        if (!req.session.userId) {
            console.log("no session ID")
            return null
        }

        return User.findOne({ where: {id: req.session.userId}});
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { datasource }: MyContext
    ): Promise<UserResponse> {
        console.log("start registering")
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: "username",
                    message: "length must be greater than 2"
                }]
            }
        }
        if (options.password.length <= 2) {
            return {
                errors: [{
                    field: "password",
                    message: "length must be greater than 2"
                }]
            }
        }
        const hashedPassword = await argon2.hash(options.password);
        let user; 
        try {
            console.log("try execute insert: ", options)
            const result = await datasource.createQueryBuilder().insert().into(User).values(
            {
                username: options.username,
                password: hashedPassword,
                email: options.email
            }
            )
            .returning('*')
            .execute();
            user = result.raw[0]
        } catch(err) {
            console.log("error registering: ", err);
            //if (err.code === '23505'  || err.detail.includes("already exists")) {
                // duplicate username error
                return {
                    errors: [{
                        field: "username",
                        message: err
                    }]
                }
          //  }
        }
        return {
            user
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne({where: {username: options.username.toLowerCase()}});
        if (!user) {
            return {
                errors: [
                    {
                    field: "username",
                    message: "username doesn't exist"
                    },
                ],
            };
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [
                    {
                    field: "password",
                    message: "incorrect password"
                    },
                ],
            };
        }

        req.session.userId = user.id
        console.log(req.session)

        return {
            user,
        }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise(resolve => req.session.destroy(err => {
            res.clearCookie(String(process.env.COOKIE_NAME));
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }

            resolve(true);
        }))
    }
}