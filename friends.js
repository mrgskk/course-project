    
            document.addEventListener('DOMContentLoaded', function() {
            // Открытие модального окна
            document.getElementById('add-friend-btn').addEventListener('click', function() {
                document.getElementById('add-friend-modal').style.display = 'block';
            });
            
            // Закрытие модального окна
            document.querySelector('.close').addEventListener('click', function() {
                document.getElementById('add-friend-modal').style.display = 'none';
            });
            
            // Поиск друзей
            document.getElementById('friend-search').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const friends = document.querySelectorAll('.friend-card');
                
                friends.forEach(friend => {
                    const name = friend.querySelector('h3').textContent.toLowerCase();
                    const email = friend.querySelector('p').textContent.toLowerCase();
                    
                    if (name.includes(searchTerm) || email.includes(searchTerm)) {
                        friend.style.display = 'flex';
                    } else {
                        friend.style.display = 'none';
                    }
                });
            });
            
            // Обработка добавления друга (заглушка)
            document.getElementById('add-friend-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('friend-email').value;
                const name = document.getElementById('friend-name').value || email.split('@')[0];
                
                alert(`Запрос дружбы отправлен для ${name} (${email})`);
                document.getElementById('add-friend-modal').style.display = 'none';
                this.reset();
            });
            
            // Удаление друга
            document.querySelectorAll('.friend-action.remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    const friendCard = this.closest('.friend-card');
                    const friendName = friendCard.querySelector('h3').textContent;
                    
                    if (confirm(`Вы уверены, что хотите удалить ${friendName} из друзей?`)) {
                        friendCard.remove();
                    }
                });
            });
        });
        

        