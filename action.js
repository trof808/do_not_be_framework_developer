export const addToCartAction = async (productId) => {
    try {
        // Получаем продукт по ID
        const product = productStore.getProductById(productId);
        // Получаем количество продукта в коризне
        const productInBasket = basketStore.getProductCount(productId);

        // Проверяем, что товар еще доступен на складе
        const noAvailableAmount = executeAction(checkProductAvailable, { productId, productInBasket });
        if (noAvailableAmount) return;

        // Добавляем в корзину
        dispatch(ADD_TO_CART, { ...product, quantity: 1 })

        // Обновляем localStorage
        localStorage.setItem('cart', currentCart);

        // Синхронизация с API
        await syncCartWithAPI();
    } catch (error) {}
};

it('Проверка добавления товара в корзину', async () => {
    const context = mockAppContext({
        stores: [productStoreMock, baskStoreMock],
        services: [localStorageMock, apiMock]
    })
    // Мокируем ответ от API
    context.api.mockResponseOnce(JSON.stringify({ success: true }));

    await runAction(addToCartAction(productId));

    // Проверка вызова функций
    expect(productStore.getProductById).toHaveBeenCalledWith(productId);
    expect(basketStore.getProductCount).toHaveBeenCalledWith(productId);
    
    // Проверка обновления localStorage
    expect(localStorageMock).toHaveBeenCalledWith('cart', expect.any(String)); // Проверяем, что cart обновляется

    // Проверка вызова API
    expect(apiMock).toHaveBeenCalledTimes(1);
});