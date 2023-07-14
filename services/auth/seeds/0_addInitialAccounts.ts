import { Knex } from "knex";
import { faker } from "@faker-js/faker";
import configs from "../configs";

const config = {
  phone: {
    number: {
      length: 11,
    },
    format: `79${"#".repeat(9)}`, // Phone in format of 79#########
  },
  password: {
    hash: {
      length: 32,
    },
  },
  refresh: {
    token: {
      length: 16,
    },
  },
  user: {
    count: 4,
  },
};

type User = {
  id?: number;
  firstName: string;
  secondName: string;
  middleName: string;
  profilePicture?: number[];
};

type Account = {
  id?: number;
  phone: string;
  passwordHash: string;
  refreshToken: string;
  userId: Pick<User, "id">;
  registrationDate: ReturnType<Date["toISOString"]>;
  permissions: number;
};

const createRandomUser: () => User = () => {
  const sex = faker.person.sexType();

  return {
    firstName: faker.person.firstName(sex),
    secondName: faker.person.lastName(sex),
    middleName: faker.person.middleName(sex),
    profilePicture: null,
  };
};

const createRandomAccount: (userId: Pick<User, "id">) => Account = (
  userId
) => ({
  phone: faker.phone.number(config.phone.format),
  passwordHash: faker.string.alphanumeric(config.password.hash.length),
  refreshToken: faker.string.alphanumeric({
    length: config.refresh.token.length,
  }),
  userId,
  registrationDate: faker.date.past().toISOString(),
  permissions: configs.development.permissions.default,
});

const USERS: User[] = faker.helpers.multiple(createRandomUser, {
  count: config.user.count,
});

export const seed = async (knex: Knex): Promise<void> => {
  await Promise.all([knex("users").delete(), knex("accounts").delete()]);

  const userIds = await knex("users").insert(USERS).returning("id");

  const accounts = userIds.map(({ id: userId }: Pick<User, "id">) =>
    createRandomAccount(userId as Pick<User, "id">)
  );

  await knex("accounts").insert(accounts);
};
