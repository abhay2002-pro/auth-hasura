const express = require("express")
const bcrypt = require("bcrypt")
const router = express.Router()
const fetch = require("node-fetch")

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
    const hashedPassword = bcrypt.hash(password, 10)

    const { data, errors } = await execute({ username, hashedPassword });

    if (errors) {
        return res.status(400).json(errors[0])
    }

    return res.json({
        ...data.insert_users
    })

});

module.exports = router