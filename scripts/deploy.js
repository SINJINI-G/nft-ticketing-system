async function main() {
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const contract = await TicketNFT.deploy();
  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
