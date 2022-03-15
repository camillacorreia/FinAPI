const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

app.post("/account", (request, response) => {
  const id = uuidv4();
  const { name, cpf } = request.body;

  const customerAlredyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if(customerAlredyExists) {
    return response.status(400).json({ error: "Customer alredy exists!"})
  }

  customers.push({
    id: uuidv4,
    name,
    cpf,
    statement: []
  });

  return response.status(201).send();
})

app.listen(3333);