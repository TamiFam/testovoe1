import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [startDate, setStartDate] = useState(''); // Начальная дата диапазона
  const [endDate, setEndDate] = useState(''); // Конечная дата диапазона
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(2); 
  // Обработчики для изменения статуса
  const handleTakeRequest = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/requests/${id}/take`);
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === id ? { ...request, status: 'В работе' } : request
        )
      );
    } catch (error) {
      console.error('Ошибка при взятии обращения:', error);
      alert('Не удалось взять обращение в работу.');
    }
  };

  const handleCompleteRequest = async (id) => {
    if (!solution) {
      alert('Пожалуйста, введите решение.');
      return;
    }

    try {
      await axios.patch(`http://localhost:3001/requests/${id}/complete`, { solution });
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === id ? { ...request, status: 'Завершено', solution } : request
        )
      );
      setSolution('');
    } catch (error) {
      console.error('Ошибка при завершении обращения:', error);
      alert('Не удалось завершить обращение.');
    }
  };

  const handleCancelRequest = async (id) => {
    if (!solution) {
      alert('Пожалуйста, введите решение.');
      return;
    }

    try {
      await axios.patch(`http://localhost:3001/requests/${id}/cancel`, { solution });
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === id ? { ...request, status: 'Отменено', solution } : request
        )
      );
      setSolution('');
    } catch (error) {
      console.error('Ошибка при отмене обращения:', error);
      alert('Не удалось отменить обращение.');
    }
  };

  // Загрузка обращений с сервера
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/requests', {
          params: { startDate, endDate }, // Передаем диапазон дат на сервер
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке обращений:', error);
        alert('Не удалось загрузить обращения. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [startDate, endDate]); // Зависимость от startDate и endDate

  // Логика для отображения обращений на текущей странице
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);

  // Переключение страниц
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Список обращений</h2>

      {/* Фильтр по диапазону дат */}
      <div className="mb-2 flex gap-2">
        <div className="flex-1">
          <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="startDate">
            Начальная дата
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 text-xs leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="endDate">
            Конечная дата
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 text-xs leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      {/* Поле для ввода текста решения */}
      <div className="mb-2">
        <label className="block text-gray-700 text-xs font-bold mb-1 " htmlFor="solution">
          Решение
        </label>
        <textarea
          id="solution"
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 text-xs leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Введите текст решения"
          rows={2} // Уменьшаем высоту текстового поля
        />
      </div>

      {/* Список обращений */}
      {loading ? (
        <p className="text-xs">Загрузка...</p>
      ) : (
        <>
          <ul>
            {currentRequests.map((request) => (
              <li key={request._id} className="mb-2 p-2 border rounded flex justify-between text-xs">
                <div>
                  <h3 className="font-bold">{request.title}</h3>
                  <p>{request.description}</p>
                  <p>Статус: {request.status}</p>
                  <p>Дата: {new Date(request.createdAt).toLocaleDateString()}</p>
                  <div className="mt-1">
                    <button
                      onClick={() => handleTakeRequest(request._id)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs mr-1"
                    >
                      Взять
                    </button>
                    <button
                      onClick={() => handleCompleteRequest(request._id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs mr-1"
                    >
                      Завершить
                    </button>
                    <button
                      onClick={() => handleCancelRequest(request._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      Отменить
                    </button>
                  </div>
                </div>
                {request.solution && (
                  <div className="ml-2 p-2 bg-gray-100 rounded text-xs">
                    <p className="font-bold ">Решение:</p>
                    <p className='bg-green-300'>{request.solution}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Пагинация */}
          <div className="flex justify-center mt-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded-l text-xs"
            >
              Назад
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastRequest >= requests.length}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded-r text-xs"
            >
              Вперед
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RequestList;

  

  