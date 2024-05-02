import * as fs from "fs";
import * as http from "http";
import * as Koa from "koa";
import koaBody from "koa-body";
import * as path from "path";
import * as uuid from "uuid";
import Ticket from "./Ticket.js";
import {saveTickets, loadTickets} from "./dataUtils.js";
import Application from "koa";

const app = new Application();
const tickets = loadTickets();

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
  if (context.request.method !== 'POST') {
    next();
    return;
  }
  console.log(context.request.body);
  const { name, status, description } = context.request.body;
  context.response.set('Access-Control-Allow-Origin', '*');
  tickets.push(new Ticket(uuid.v4(), name, status, Date.now()));
  saveTickets(tickets);
  context.response.body = 'OK';
  next();
}

