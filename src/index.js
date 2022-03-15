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

  const newCustomer = {
    id,
    name,
    cpf,
    statement: []
  }

  customers.push(newCustomer);

  return response.status(201).send(newCustomer);
})

app.get("/statement/:cpf", (request, response) => {
  const { cpf } = request.params;

  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer) {
    return response.status(400).json({ error: "Customer not found"})
  }

  return response.json(customer.statement);
});

app.listen(3333);