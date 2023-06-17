# Client

## Hướng dẫn cài đặt

### Chỉnh sửa địa chỉ server
Thay đổi giá trị biến `Config.SERVER` trong file `src/Game/GameConfig.js` thành địa chỉ của server.

### Host client
Có thể chạy file `run.bat` hoặc `runPhp.bat` khi đã cài đặt cocos hoặc php để chạy client.
Sau đó truy cập vào [localhost:8080]() hoặc [localhost]() để chơi game.

## Hướng dẫn build client
1. Chạy lệnh `cocos compile -p web -m release`
2. Khi chạy sẽ bị lỗi và tạo ra file `publish/html5/build.xml`
3. Trong task `jscomp` sửa phần `classpath` lại thành đường dẫn của môt phiên bản Closure Compiler mới hơn. Ở đây mình dùng bản closure-compiler-v20191111. Đồng thời chỉnh sửa thông tin trong file lại phù hợp.
4. Sau đó `cd` vào thư mục `publish\html5`, chạy lại file build.xml này bằng Ant với lệnh `ant -d` sẽ được file `publish/html5/game.min.js`
5. Tạo project mới và chạy lệnh ở bước 1 với project đó. Copy file `index.html` và `project.json`.
6. Cuối cùng copy thư mục `res` ở thư mục gốc vào.
