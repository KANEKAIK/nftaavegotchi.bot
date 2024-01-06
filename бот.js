
import { get } from "axios"; // библиотека для HTTP-запросов
import web3, { providers } from "web3"; // библиотека для взаимодействия с блокчейном
const provider = new providers.HttpProvider("https://rpc-mainnet.maticvigil.com"); // провайдер для подключения к блокчейну Polygon
const web3Instance = new web3(provider); // экземпляр web3
import erc721ABI from "./erc721ABI.json"; // ABI стандарта ERC721 вставишь
const aavegotchiAddress = "0x86935F11C86623deC8a25696E1C19a8659CbF95d"; // адрес контракта aavegotchi вставишь 
const aavegotchiContract = new web3Instance.eth.Contract(erc721ABI, aavegotchiAddress); // экземпляр контракта aavegotchi вставишь
import marketplaceABI from "./marketplaceABI.json"; // ABI контракта маркетплейса aavegotchi вставишь 
const marketplaceAddress = "0xE468cE99444174Bd3bBBEd09209577d25D1ad673"; // адрес контракта маркетплейса aavegotchi вставишь
const marketplaceContract = new web3Instance.eth.Contract(marketplaceABI, marketplaceAddress); // экземпляр контракта маркетплейса aavegotchi тоже вставишь
const account = "0x..."; // адрес кошелька 
const privateKey = "0x..."; // приватный ключ 

// Функция для ставки на NFT на aavegotchi
async function bidOnNFT(tokenId, bidAmount) {
  try {
    // Получить цену
    const listing = await marketplaceContract.methods.getERC721Listing(tokenId, aavegotchiAddress).call();
    const currentPrice = listing.priceInWei;
    // Проверка ставки
    if (bidAmount > currentPrice) {
      // Перевод  (транзакция)
      const txData = {
        from: account,
        to: marketplaceAddress,
        value: bidAmount, // в wei
        gas: 200000, // оценка газа
        data: marketplaceContract.methods.executeERC721Bid(tokenId, aavegotchiAddress).encodeABI(), // данные для вызова метода контракта
      };
      // Подписываем транзакцию с помощью приватного ключа
      const signedTx = await web3Instance.eth.accounts.signTransaction(txData, privateKey);
      // Отправляем транзакцию в блокчейн
      const txReceipt = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
      // Выводим результат транзакции в консоль
      console.log(`Bid on NFT ${tokenId} for ${bidAmount} wei. Tx hash: ${txReceipt.transactionHash}`);
    } else {
      // Выводим сообщение, что наша ставка слишком мала
      console.log(`Bid too low for NFT ${tokenId}. Current price: ${currentPrice} wei`);
      const bidAmounts = []; 
    }
  } catch (error) {
    // Обрабатываем ошибки
    console.error(error);
  }
}

// Функция для выбора NFT, на которые хотим ставить
async function chooseNFTs() {
  const minRarity = 500; // минимальная редкость NFT
  const maxPrice = 0.5; // максимальная цена NFT в ETH
  const bidAmounts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; // массив сумм, которые хотим ставить на NFT
  // Получаем список всех NFT, которые есть на маркетплейсе
  const allNFTs = await marketplaceContract.methods.getAllERC721Listings(aavegotchiAddress).call();
  // Проходим по каждому NFT и проверяем, подходит ли он нам
  for (let nft of allNFTs) {
    // Получаем идентификатор и цену NFT
    const tokenId = nft.erc721TokenId;
    const price = nft.priceInWei;
    // Получаем метаданные NFT
    const tokenURI = await aavegotchiContract.methods.tokenURI(tokenId).call();
    // Получаем данные из метаданных (например, имя, редкость, атрибуты и т.д.)
    const tokenData = await get(tokenURI);
    // Получаем редкость NFT
    const rarity = tokenData.data.rarityScore;
    // Проверяем, что редкость NFT больше или равна минимальной редкости
    if (rarity >= minRarity) {
      // Проверяем, что цена NFT меньше или равна максимальной цене
      if (price <= web3Instance.utils.toWei(maxPrice.toString(), "ether")) {
        // Выбираем случайную сумму из массива сумм
        const bidAmount = bidAmounts[Math.floor(Math.random() * bidAmounts.length)];
        // Ставим ставку на NFT
        await bidOnNFT(tokenId, web3Instance.utils.toWei(bidAmount.toString(), "ether"));
      }
    }
  }
}

// Вызываем функцию каждые 10 минут
setInterval(chooseNFTs, 600000);
