document.getElementById('cep-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const email = document.getElementById('email').value;
    const cep = document.getElementById('cep').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    if (!cep && (!latitude || !longitude)) {
        alert("Por favor, preencha todos os campos necessários.");
        return;
    }

    try {
        if (cep) {
            // Busca o endereço pelo CEP
            const addressData = await fetchAddress(cep);
            if (addressData) {
                document.getElementById('logradouro').innerText = addressData.logradouro;
                document.getElementById('bairro').innerText = addressData.bairro;
                document.getElementById('localidade').innerText = `${addressData.localidade}/${addressData.uf}`;

                // Se obtivermos um CEP válido, vamos pegar a latitude e a longitude do local
                const locationData = await fetchLocation(addressData.localidade, addressData.uf);
                if (locationData) {
                    const { lat, lon } = locationData;
                    const weatherData = await fetchWeather(lat, lon);
                    if (weatherData) {
                        document.getElementById('temperature').innerText = weatherData.current_weather.temperature;
                    }
                }
            }
        } else if (latitude && longitude) {
            // Busca a previsão do tempo pela latitude e longitude
            const weatherData = await fetchWeather(latitude, longitude);
            if (weatherData) {
                document.getElementById('temperature').innerText = weatherData.current_weather.temperature;
            }
        }
    } catch (error) {
        console.error(error);
        alert("Ocorreu um erro ao buscar os dados. Tente novamente.");
    }
});

async function fetchAddress(cep) {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (response.ok) {
        const data = await response.json();
        if (data.erro) {
            throw new Error("CEP não encontrado.");
        }
        return data;
    } else {
        throw new Error("Erro ao buscar dados do endereço.");
    }
}

async function fetchLocation(city, state) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${city},${state},Brazil&format=json&limit=1`);
    if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
            return {
                lat: data[0].lat,
                lon: data[0].lon
            };
        } else {
            throw new Error("Localização não encontrada.");
        }
    } else {
        throw new Error("Erro ao buscar dados de localização.");
    }
}

async function fetchWeather(lat, lon) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error("Erro ao buscar dados de previsão do tempo.");
    }
}
