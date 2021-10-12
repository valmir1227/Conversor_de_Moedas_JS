/*
    - Quando a página for carregada: 
      - Popule os <select> com tags <option> que contém as moedas que podem ser
        convertidas. "BRL" para real brasileiro, "EUR" para euro, "USD" para 
        dollar dos Estados Unidos, etc.
      - O option selecionado por padrão no 1º <select> deve ser "USD" e o option
        no 2º <select> deve ser "BRL";
      - O parágrafo com data-js="converted-value" deve exibir o resultado da 
        conversão de 1 USD para 1 BRL;
      - Quando um novo número for inserido no input com 
        data-js="currency-one-times", o parágrafo do item acima deve atualizar 
        seu valor;
      - O parágrafo com data-js="conversion-precision" deve conter a conversão 
        apenas x1. Exemplo: 1 USD = 5.0615 BRL;
      - O conteúdo do parágrafo do item acima deve ser atualizado à cada 
        mudança nos selects;
      - O conteúdo do parágrafo data-js="converted-value" deve ser atualizado à
        cada mudança nos selects e/ou no input com data-js="currency-one-times";
      - Para que o valor contido no parágrafo do item acima não tenha mais de 
        dois dígitos após o ponto, você pode usar o método toFixed: 
*/
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
