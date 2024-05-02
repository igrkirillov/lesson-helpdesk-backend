import * as fs from "fs";

export function loadTickets() {
  return fs.readFileSync("./data/tickets.json").toJSON();
}

export function saveTickets(json) {
  fs.writeFileSync(ticketsPath, JSON.stringify(json));
}