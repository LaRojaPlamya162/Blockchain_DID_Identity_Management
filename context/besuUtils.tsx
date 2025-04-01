import { ethers } from "ethers";

// Hàm kiểm tra mạng Besu có đang hoạt động không
export async function isBesuOnline(): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");

    const networkPromise = provider.getNetwork();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout khi kết nối đến Besu")), 5000);
    });

    await Promise.race([networkPromise, timeoutPromise]);

    const blockNumber = await provider.getBlockNumber();
    console.log(`Kết nối thành công đến Besu. Block hiện tại: ${blockNumber}`);

    return true;
  } catch (error) {
    console.error(`Lỗi khi kết nối đến Besu: ${error instanceof Error ? error.message : error}`);
    return false;
  }
}
