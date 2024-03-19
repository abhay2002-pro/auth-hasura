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
    let { username, password } = req.body.input;
    console.log("username ", username)
    console.log("password ", password)
    password = await bcrypt.hash(password, 10); // Hash the password
    console.log("hashedPassword ", password); // Log the hashed password
    const { data, errors } = await execute({ username, password });

    if (errors) {
        return res.status(400).json(errors[0])
    }

    return res.json({
        ...data.insert_users
    })

});

export default router;
