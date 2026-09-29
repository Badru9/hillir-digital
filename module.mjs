// @ts-check
import { module } from "@prisma/composer";
import { postgres, dataContract } from "@prisma/composer-prisma-cloud/orm";
import hillirContractJson from "./src/prisma/contract.json" with { type: "json" };
import hillirService from "./service.mjs";

export default module("hillir-digital", ({ provision }) => {
  const database = provision(postgres({ name: "database", contract: dataContract(hillirContractJson), config: "./prisma.config.ts" }));
  provision(hillirService, { deps: { db: database } });
});
