
import { get } from "axios"; // библиотека для HTTP-запросов
import web3, { providers } from "web3"; // библиотека для взаимодействия с блокчейном
const provider = new providers.HttpProvider("https://rpc-mainnet.maticvigil.com"); // провайдер для подключения к блокчейну Polygon (должно работать ебу)
const web3Instance = new web3(provider); // экземпляр web3
import aavegotchiABI from "вставь сюда"; // ABI контракта aavegotchi вставишь можно просто ссылку на файл
const aavegotchiAddress = "вставь сюда"; // адрес контракта aavegotchi вставишь также само
const aavegotchiContract = new web3Instance.eth.Contract(aavegotchiABI, aavegotchiAddress); // экземпляр контракта aavegotchi вот я ебу я сделал так а ты посмотришь

// Хуйня которая следит за новыми nft 
async function getNewNFTs() {
  try {
    // Получаем номер последнего блока
    const latestBlock = await web3Instance.eth.getBlockNumber();
    // Хапаем список событий Transfer, которыые произошли с контракта aavegotchi с последнего блока
    const transferEvents = await aavegotchiContract.getPastEvents("Transfer", {
      fromBlock: latestBlock - 1,
      toBlock: latestBlock,
    });
    // Фильтруем события, которые соответствуют созданию нового NFT (отправитель - нулевой адрес)
    const newNFTEvents = transferEvents.filter(
      (event) => event.returnValues.from === "0x0000000000000000000000000000000000000000"
    );
    // Проходим по каждому событию и получаем информацию о новом NFT
    for (let event of newNFTEvents) {
      // Получаем идентификатор NFT
      const tokenId = event.returnValues.tokenId;
      // Получаем метаданные NFT
      const tokenURI = await aavegotchiContract.methods.tokenURI(tokenId).call();
      // Получаем данные из метаданных (например, имя, редкость, атрибуты и т.д.)
      const tokenData = await get(tokenURI);
      // Выводим информацию о новом NFT в консоль
      console.log(`New NFT created: ${tokenData.data.name} (ID: ${tokenId})`);
    }
  } catch (error) {
    // Обрабатываем ошибки
    console.error(error);
  }
}

// Вызываем функцию каждые 10 секунд ну или сколько захочешь
setInterval(getNewNFTs, 10000);