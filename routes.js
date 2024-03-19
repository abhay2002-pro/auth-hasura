import express from "express";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

const router = express.Router()


const HASURA_OPERATION = `
mutation MyMutation($username: String!, $password: String!) {
  insert_users(objects: {username: $username, password: $password}) {
    affected_rows
  }
}
`;

const execute = async (variables) => {
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
    const { username, password } = req.body.input;
    console.log("username ", username)
    console.log("password ", password)
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("hashedPassword ", hashedPassword)
    const { data, errors } = await execute({ username, hashedPassword });

    if (errors) {
        return res.status(400).json(errors[0])
    }

    return res.json({
        ...data.insert_users
    })

});

export default router