document.getElementById('healthForm').addEventListener('submit', function (e) {
    e.preventDefault();
    
    // 各項目の値を取得
    const maxBloodPressure = document.getElementById('maxBloodPressure').value;
    const minBloodPressure = document.getElementById('minBloodPressure').value;
    const triglycerides = document.getElementById('triglycerides').value;
    const hdl = document.getElementById('hdl').value;
    const ldl = document.getElementById('ldl').value;
    const hba1c = document.getElementById('hba1c').value;
    const fastingBloodSugar = document.getElementById('fastingBloodSugar').value;
    
    // 都道府県、性別、生年月日の取得
    const prefecture = document.getElementById('prefecture').value;
    const gender = document.getElementById('gender').value;
    const birthdate = document.getElementById('birthdate').value;

    // 結果をローカルストレージに保存
    localStorage.setItem('maxBloodPressure', maxBloodPressure);
    localStorage.setItem('minBloodPressure', minBloodPressure);
    localStorage.setItem('triglycerides', triglycerides);
    localStorage.setItem('hdl', hdl);
    localStorage.setItem('ldl', ldl);
    localStorage.setItem('hba1c', hba1c);
    localStorage.setItem('fastingBloodSugar', fastingBloodSugar);
    
    // 追加したデータをローカルストレージに保存
    localStorage.setItem('prefecture', prefecture);
    localStorage.setItem('gender', gender);
    localStorage.setItem('birthdate', birthdate);
    
    // 結果画面に遷移
    window.location.href = 'result_display.html';
});
