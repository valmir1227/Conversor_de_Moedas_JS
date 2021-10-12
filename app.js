const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const currenciesEl = document.querySelector('[data-js="currencies-container"]');
const convertedValueEl = document.querySelector('[data-js="converted-value"]');
const valuePrescisionEl = document.querySelector(
  '[data-js="conversion-precision"]'
);
const timesCurrencyOneEl = document.querySelector(
  '[data-js="currency-one-times"]'
);

let internalExchangeRate = {};

const getUrl = (currency) =>
  `https://v6.exchangerate-api.com/v6/6f67c27fddb6606c0768bd41/latest/${currency}`;

const getErrormessage = (errorType) =>
({
  "unsupported-code":
    "if we dont support the supplied currency code (see supported currencies...).",
  "malformed-request":
    "when some part of your request doesn't follow the structure shown above.",
  "invalid-key": "when your API key is not valid.",
  "inactive-account": "if your email address wasn't confirmed.",
  "quota-reached":
    "when your account has reached the the number of requests allowed by your plan.",
}[errorType] || "Não foi possivél obter as informações.");

const fetchExchangeRate = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Sua conexão falhou. Não foi possível obter as informações."
      );
    }

    const exchangeRateData = await response.json();

    if (exchangeRateData.result === "error") {
      throw new Error(getErrormessage(exchangeRateData["error-type"]));
    }

    return exchangeRateData;
  } catch (err) {
    const div = document.createElement("div");
    const button = document.createElement("button");

    div.textContent = err.message;
    div.classList.add(
      "alert",
      "alert-warning",
      "alert-dismissible",
      "fade",
      "show"
    );
    div.setAttribute("role", "alert");
    button.classList.add("btn-close");
    button.setAttribute("aria-label", "Close");
    button.setAttribute("type", "button");

    button.addEventListener("click", () => {
      div.remove();
    });

    div.appendChild(button);
    currenciesEl.insertAdjacentElement("afterend", div);

    //console.log(div)

    /*
<div class="alert alert-warning alert-dismissible fade show" role="alert">
  Mensagem do erro
  <button type="button" class="btn-close" aria-label="Close"></button>
</div>
*/
  }
};

const init = async () => {
  const exchangeRateData = (internalExchangeRate = {
    ...(await fetchExchangeRate(getUrl("USD"))),
  });

  const getOptions = (selectedCurrency) =>
    Object.keys(internalExchangeRate.conversion_rates)
      .map(
        (currency) =>
          `<option ${currency === selectedCurrency ? "selected" : ""
          }>${currency}</option>`
      )
      .join("");

  currencyOneEl.innerHTML = getOptions("USD");
  currencyTwoEl.innerHTML = getOptions("BRL");

  convertedValueEl.textContent =
    internalExchangeRate.conversion_rates.BRL.toFixed(2);
  valuePrescisionEl.textContent = `1 USD =
   ${internalExchangeRate.conversion_rates.BRL} BRL`;
};
timesCurrencyOneEl.addEventListener("input", (e) => {
  convertedValueEl.textContent = (
    e.target.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]
  ).toFixed(2);
});

currencyTwoEl.addEventListener("input", (e) => {
  const currencyTwoValue =
    internalExchangeRate.conversion_rates[e.target.value];

  convertedValueEl.textContent = (
    timesCurrencyOneEl.value * currencyTwoValue
  ).toFixed(2);
  valuePrescisionEl.textContent = `1 ${currencyOneEl.value} =
   ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value
    }`;
});

currencyOneEl.addEventListener("input", async (e) => {
  const exchangeRateData = await fetchExchangeRate(getUrl(e.target.value));

  internalExchangeRate = {
    ...(await fetchExchangeRate(getUrl(e.target.value))),
  };

  convertedValueEl.textContent = (
    timesCurrencyOneEl.value *
    internalExchangeRate.conversion_rates[currencyTwoEl.value]
  ).toFixed(2);
  valuePrescisionEl.textContent = `1 ${currencyOneEl.value} =
  ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value
    } `;
});

init();
