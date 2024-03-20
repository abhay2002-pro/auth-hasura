import express from "express";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

const router = express.Router();

const execute = async (variables, HASURA_OPERATION) => {
  const fetchResponse = await fetch(
    "https://concrete-airedale-11.hasura.app/v1/graphql",
    {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": "3MW1mI82c0G744EFNV3V91Qf8Uo41B9qBkp0TbvgrdHoLJjHniiKYA5Iop7y9qfG", 
      },
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      })
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG: ', data);
  return data;
};

router.post('/InsertUser', async (req, res) => {
    let { username, password } = req.body.input;
    password = await bcrypt.hash(password, 10);

    const HASURA_OPERATION = `
        mutation MyMutation($username: String!, $password: String!) {
          insert_users(objects: {username: $username, password: $password}) {
            affected_rows
          }
        }
    `;

    const { data, errors } = await execute({ username, password }, HASURA_OPERATION);

    if (errors) {
        return res.status(400).json(errors[0]);
    }

    return res.json({
        ...data.insert_users
    });

});

router.post('/SignIn', async (req, res) => {
    const { username, password } = req.body.input;

    const HASURA_OPERATION = `
      query MyQuery($username: String!) {
        users(where: {username: {_eq: $username}}) {
          id,
          password
        }
      }      
    `;
      
    const { data, errors } = await execute({ username }, HASURA_OPERATION);

    if (errors) {
        return res.status(400).json(errors[0]);
    }

    if (data.users.length === 0) {
        return res.status(401).json({ message: "User not found" });
    }

    const hashedPassword = data.users[0].password;

    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { "https://hasura.io/jwt/claims": {
          "x-hasura-admin-secret": "3MW1mI82c0G744EFNV3V91Qf8Uo41B9qBkp0TbvgrdHoLJjHniiKYA5Iop7y9qfG",
          "x-hasura-allowed-roles":  ["admin", "user"],
          "x-hasura-default-role": "user"
        }
      }, 
      '3EK6FD+o0+c7tzBNVfjpMkNDi2yARAAKzQlk8O2IKoxQu4nF7EdAh8s3TwpHwrdWT6R', 
      {
        expiresIn: '1h',
      }
    );

    return res.json({
        accessToken: token
    });
});

export default router;
