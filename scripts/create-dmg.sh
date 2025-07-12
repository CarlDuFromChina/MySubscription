#!/bin/bash

# 创建 DMG 文件的脚本
set -e

APP_NAME="订阅簿"
APP_PATH="build/mac/${APP_NAME}.app"
DMG_NAME="build/${APP_NAME}-0.0.1.dmg"
VOLUME_NAME="${APP_NAME}"

# 检查应用是否存在
if [ ! -d "$APP_PATH" ]; then
    echo "错误: 应用程序 $APP_PATH 不存在"
    echo "请先运行 npm run build:dir 构建应用"
    exit 1
fi

# 删除已存在的 DMG 文件
if [ -f "$DMG_NAME" ]; then
    rm "$DMG_NAME"
fi

echo "开始创建 DMG 文件..."

# 使用 create-dmg 创建 DMG
create-dmg \
    --volname "$VOLUME_NAME" \
    --volicon "build/icons/icon.icns" \
    --window-pos 200 120 \
    --window-size 800 400 \
    --icon-size 100 \
    --icon "${APP_NAME}.app" 200 190 \
    --hide-extension "${APP_NAME}.app" \
    --app-drop-link 600 185 \
    --no-internet-enable \
    "$DMG_NAME" \
    "$APP_PATH"

echo "DMG 文件创建成功: $DMG_NAME"
