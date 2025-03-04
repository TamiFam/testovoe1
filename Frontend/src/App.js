import React, { useState } from 'react';
import CreateRequest from '../src/request/CreateRequest';
import RequestList from '../src/request/RequestList';

const App = () => {
  const [requests, setRequests] = useState([]); // Состояние для хранения обращений
  const [isLoading, setIsLoading] = useState(false); // Состояние для отображения загрузки
  const [specificDate, setSpecificDate] = useState(''); // Состояние для конкретной даты
  const [startDate, setStartDate] = useState(''); // Состояние для начальной даты диапазона
  const [endDate, setEndDate] = useState(''); // Состояние для конечной даты диапазона
  

  // Функция для загрузки обращений с сервера
  const fetchRequests = async () => {
    setIsLoading(true); // Показываем индикатор загрузки
    

    // Формируем параметры запроса
    const params = new URLSearchParams();
    if (specificDate) {
      params.append('specificDate', specificDate);
    }
    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    }

    try {
      const response = await fetch(`http://localhost:3001/requests?${params.toString()}`);
      const data = await response.json();
      setRequests(data); // Обновляем состояние с данными
    } catch (error) {
      console.error('Ошибка при загрузке обращений:', error);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Управление обращениями</h1>
      <CreateRequest />

      

    

      {/* Кнопка для загрузки обращений */}
      <button
        onClick={fetchRequests}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        Получить список обращений
      </button>

      {/* Отображение списка обращений */}
      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
        <RequestList requests={requests} />
      )}
    </div>
  );
};

export default App;