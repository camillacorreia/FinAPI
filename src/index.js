const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

// Middleware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.params;

  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer) {
    return response.status(400).json({ error: "Customer not found"})
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

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
});

app.get("/statement/:cpf", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

// Precisa que todas as rotas passem por esse middleware ==> app.use(verifyIfExistsAccountCPF)

app.post("/deposit/:cpf", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;
  
  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send(statementOperation);
});

app.post("/withdraw/:cpf", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance =  getBalance(customer.statement);

  if(balance < amount) {
    return response.status(400).send({ error: "Insufficient funds!"})
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send(statementOperation);
});

app.get("/statement/date/:cpf", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString()
  );

  return response.json(statement);
});

app.put("/account/:cpf", verifyIfExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send(name);
})

app.get("/account/:cpf", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.status(201).send(customer);
})

app.delete("/account/:cpf", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(201).send(customers);
})

app.listen(3333);