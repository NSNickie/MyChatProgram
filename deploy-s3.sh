#!/bin/sh

DEV_HOST_DIR="dev-web-supplier"

date=$(date '+%Y-%m-%d_%H:%M:%S')
backup_dir="dist_"$date

echo "backup to "$backup_dir

rm dist -rf
npm run build

aws s3 cp s3://$DEV_HOST_DIR/favicon.ico         s3://$DEV_HOST_DIR/back_up/$backup_dir/favicon.ico
aws s3 cp s3://$DEV_HOST_DIR/index.html          s3://$DEV_HOST_DIR/back_up/$backup_dir/index.html
aws s3 cp s3://$DEV_HOST_DIR/assets/             s3://$DEV_HOST_DIR/back_up/$backup_dir/assets/             --recursive
aws s3 cp s3://$DEV_HOST_DIR/img/                s3://$DEV_HOST_DIR/back_up/$backup_dir/img/                --recursive
aws s3 cp s3://$DEV_HOST_DIR/.well-known/        s3://$DEV_HOST_DIR/back_up/$backup_dir/.well-known/        --recursive

aws s3 rm s3://$DEV_HOST_DIR/favicon.ico
aws s3 rm s3://$DEV_HOST_DIR/index.html
aws s3 rm s3://$DEV_HOST_DIR/assets/             --recursive
aws s3 rm s3://$DEV_HOST_DIR/img/                --recursive
aws s3 rm s3://$DEV_HOST_DIR/.well-known/        --recursive

aws s3 cp dist               s3://$DEV_HOST_DIR/               --recursive
aws s3 cp .well-known        s3://$DEV_HOST_DIR/.well-known/   --recursive
