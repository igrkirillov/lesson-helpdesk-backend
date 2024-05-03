import * as fs from "fs";
import * as http from "http";
import * as Koa from "koa";
import {koaBody} from "koa-body";
import * as path from "path";
import * as uuid from "uuid";
import Ticket from "./Ticket.js";
import {saveTickets, loadTickets} from "./dataUtils.js";
import Application from "koa";

const app = new Application();
const tickets = loadTickets() || [];

app.use(koaBody({
  urlencoded: true,
  multipart: true,

}));
app.use((ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') {
    next();
    return;
  }
  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
  ctx.response.status = 204;
});

app.use(createTicket);
app.use(updateById);
app.use(allTickets);

const server = http.createServer(app.callback());
const port = process.env.PORT || 7070;
server.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Server is listening to ' + port);
});

function createTicket(context, next) {
  if (context.request.method !== 'POST' || getMethodName(context.request) !== "createTicket") {
    next();
    return;
  }
  const { name, status, description } = context.request.body;
  context.response.set('Access-Control-Allow-Origin', '*');
  tickets.push(new Ticket(uuid.v4(), name, status, description, Date.now()));
  saveTickets(tickets);
  context.response.body = 'OK';
  next();
}

function updateById(context, next) {
  if (context.request.method !== 'PATCH' || getMethodName(context.request) !== "updateById") {
    next();
    return;
  }
  const id = getId(context.request);
  context.response.set('Access-Control-Allow-Origin', '*');
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    context.response.status = 404;
    context.response.body = 'Not Found';
  } else {
    const { name, status, description } = context.request.body;
    ticket.name = name;
    ticket.status = status;
    ticket.description = description;
    saveTickets(tickets);
    context.response.body = 'OK';
  }
  next();
}

function allTickets(context, next) {
  if (context.request.method !== 'GET' || getMethodName(context.request) !== "allTickets") {
    next();
    return;
  }
  context.response.set('Access-Control-Allow-Origin', '*');
  context.response.body = JSON.stringify(tickets);
  context.type = "json";
  next();
}

function getMethodName(request) {
  return request.query && request.query["method"];
}

function getId(request) {
  return request.query && request.query["id"];
}
