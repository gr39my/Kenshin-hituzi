document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // フォームのデフォルトの送信動作を無効化

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 任意の条件でログインを成功とする処理（ここでは何を入力してもOK）
    if (username && password) {
        // ログイン成功
        alert('ログイン成功！');
        window.location.href = 'results.html';  // ログイン成功時の遷移先を指定
    } else {
        // ログイン失敗
        alert('ユーザー名とパスワードを入力してください');
    }
});
