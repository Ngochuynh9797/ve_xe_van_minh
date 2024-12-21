const { By, Builder, Browser } = require("selenium-webdriver");
const floor1Seats = [
  "B2",
  "B3",
  "B4",
  "B5",
  "D2",
  "D3",
  "D4",
  "D5",
  "F2",
  "F3",
  "F4",
];
const floor2Seats = [
  "A1",
  "A2",
  "A3",
  "A4",
  "A5",
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "E1",
  "E2",
  "E3",
  "E4",
];
const TOTAL = 2;
const URL =
  "https://vanminh.xeca.vn/booking/booking/book-seats?agencyId=1&theme=vanminh&startPoint=1&endPoint=2&startDate=21%2F08%2F2024";
const PCIK_UP_ADDRESS = 'GIÁT - NA';
const ARRIVE_ADDRESS = '172 Trần Bình';
const TIME_FROM = '13'
const TIME_TO = '14'
const PRICE = '300000'


function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const isComponentValid = async (elements) => {
  const timeTextElement = await elements.findElement(
    By.xpath(`(.//div[@class='ant-space-item'])[2]/div[1]`)
  );
  await delay(200)
  const piceElement = await elements.findElement(
    By.xpath(`(.//div[@class='ant-space-item'])[5]/div[1]`)
  );
  if (!timeTextElement || !piceElement) {
    return false;
  }
  const text = await timeTextElement.getText();
  const hour = text.split("-")[0].split(':')[0]
  const isHourValid = hour >= TIME_FROM && hour <= TIME_TO
  const price = await piceElement.getText()
  const priceValid = price <= PRICE
  if (isHourValid && priceValid) {
    return true;
  }
  return false;
};

const selectPickupZone = async (e) => {
  const driver = e.getDriver();
  const pickUpZoneList = await driver.findElement(
    By.xpath(`//div[@id='pickupZone_list']/following-sibling::div`)
  );
  const scrollableDiv = await pickUpZoneList.findElement(
    By.xpath(`.//div[@class='rc-virtual-list-holder']`)
  );
  let topScrollMargin = 0;
  let pickUpZone = await pickUpZoneList.findElements(
    By.xpath(`.//div[contains(@title, '${PCIK_UP_ADDRESS}')]`)
  );
  while (!pickUpZone.length) {
    topScrollMargin += 500;
    await driver.executeScript(
      `arguments[0].scrollTop = ${topScrollMargin};`,
      scrollableDiv
    );
    pickUpZone = await pickUpZoneList.findElements(
      By.xpath(`.//div[contains(@title, '${PCIK_UP_ADDRESS}')]`)
    );
  }
  await pickUpZone[0].click();
};

const selectArriveZone = async (e) => {
  const driver = e.getDriver();
  const arriveZoneList = await driver.findElement(
    By.xpath(`//div[@id='arriveZone_list']/following-sibling::div`)
  );
    const scrollableDiv = await arriveZoneList.findElement(
      By.xpath(`.//div[@class='rc-virtual-list-holder']`)
    );
    let topScrollMargin = 0;
    let arriveZone = await arriveZoneList.findElements(
      By.xpath(`.//div[contains(@title, '${ARRIVE_ADDRESS}')]`)
    );
    while (!arriveZone.length) {
      topScrollMargin += 200;
      await driver.executeScript(
        `arguments[0].scrollTop = ${topScrollMargin};`,
        scrollableDiv
      );
      arriveZone = await arriveZoneList.findElements(
        By.xpath(`.//div[contains(@title, "${ARRIVE_ADDRESS}")]`)
      );
    }
  await arriveZone[0].click();
  // const arriveZone = arriveZoneList.findElement(
  //   By.xpath(`.//div[@class='rc-virtual-list-holder-inner']/div[2]`)
  // );
  // await arriveZone.click()
};

const openSeatList = async (element) => {
  const clickButton = await element.findElement(
    By.xpath(`.//div[1]/div[5]/div[1]/button[1]`)
  );
  await clickButton.click();
};

const checkEmptySeatAndBooked = async (element) => {
  const [seatListFloorList1, seatListFloorList2] = await element.findElements(
    By.xpath(`.//ul[contains(@class, 'seat-area')]`)
  );
  const emptySeatFloor1 = await seatListFloorList1.findElements(
    By.xpath(`.//button[contains(@class, 'seat-empty')]`)
  );
  const emptySeatFloor2 = await seatListFloorList2.findElements(
    By.xpath(`.//button[contains(@class, 'seat-empty')]`)
  );
  let seatFloor1Counter = 0;
  let seatFloor2Counter = 0;
  let textSeat = ''
  for (const seat of emptySeatFloor1) {
    const text = await seat.getText();
    if (floor1Seats.includes(text)) {
      await seat.click();
      seatFloor1Counter++;
      textSeat += text
      await delay(200)
    }
    if (seatFloor1Counter === TOTAL) {
      break;
    }
  }

  if (seatFloor1Counter < TOTAL && seatFloor1Counter > 0) {
    for (const seat of emptySeatFloor2) {
      const text = await seat.getText();
      if (floor2Seats.includes(text)) {
        await seat.click();
        seatFloor2Counter++;
        textSeat += text
        await delay(200)
      }
      if (seatFloor2Counter + seatFloor1Counter === TOTAL) {
        break;
      }
    }
  }
  if (seatFloor1Counter + seatFloor2Counter === TOTAL) {
    return true;
  }
  return false;
};

const fillInfoAndSend = async (e) => {
  const mobileNo = await e.findElement(
    By.xpath(`.//input[@id='custMobileNo']`)
  );
  await mobileNo.sendKeys("0898448563");
  const customerName = await e.findElement(
    By.xpath(`.//input[@id='custName']`)
  );
  await customerName.sendKeys("Nguyen Van Dai");
  const pickUpInput = await e.findElement(
    By.xpath(`.//input[@id='pickupZone']`)
  );
  await pickUpInput.click();
  await selectPickupZone(e);
  await delay(500)
  const arriveZoneInput = await e.findElement(
    By.xpath(`.//input[@id='arriveZone']`)
  );
  await arriveZoneInput.click();
  await selectArriveZone(e);
};

const paymentSubmit = async (e) => {
  await delay(500)

  const paymentButton = await e.findElement(
    By.xpath(`.//button[.//span[text()='Thanh toán']]`)
  );
  await paymentButton.click();
};

const confirmPayment = async (driver) => {
  const confirmCheckbox = await driver.findElement(By.xpath(`//span[contains(text(), 'Tôi đồng ý quy định của')]`))
  await confirmCheckbox.click()
  const paymentButton = await driver.findElement(
    By.xpath(`.//button[.//span[text()='Thanh toán']]`)
  );
  await paymentButton.click()
}

(async function firstTest() {
  let driver;

  try {
    driver = await new Builder().forBrowser(Browser.CHROME).build();
    await driver.manage().window().maximize();
    await driver.get(URL);
    await driver.manage().setTimeouts({ implicit: 5000 });
    let elements = await driver.findElements(
      By.xpath(`//ul[contains(@class,'bus-time-list')]/li`)
    );
    for (let i = 7; i < elements.length ; i++) {
      const e = elements[i]
      await driver.actions()
        .scroll(0, 0, 0, 400, e)
        .perform()
      const isValid = await isComponentValid(e);
      if (!isValid) {
        continue;
      }
      await openSeatList(e);
      const isBookedSuccess = await checkEmptySeatAndBooked(e);
      if (!isBookedSuccess) {
        continue;
      }
      await fillInfoAndSend(e);
      // await delay(500)
      // await paymentSubmit(e);
      // await delay(500)
      // await confirmPayment(driver)
      await delay(1000 * 60 * 10)
    }
  } catch (e) {
    console.log(e);
  } finally {
    await driver.quit();
  }
})();