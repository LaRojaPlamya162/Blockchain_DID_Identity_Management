How to run
Terminal 1: cd contracts -> npx hardhat node
Terminal 2: npm run dev
Terminal 3: cd contracts -> npx hardhat run scripts/deploy.js --network besu
Change contract address in context -> besuUtils.tsx
Bonus: If you want to change your account, please fix your account private key in contracts -> hardhat.config.js (accounts category)
