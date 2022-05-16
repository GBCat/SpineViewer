<?php

namespace app\controller;

use app\BaseController;
use think\facade\Db;
use think\facade\Request;
use think\facade\View;

class Index extends BaseController
{

	public function __construct()
	{
		header('Access-Control-Allow-Origin: *');
	}

	public function index()
	{

		return View::fetch();
	}

	public function upload()
	{
		$png = request()->file('png');
		$json = request()->file('json');
		$atlas = request()->file('atlas');
		$png_dir = \think\facade\Filesystem::putFile('topic', $png);
		$json_dir = \think\facade\Filesystem::putFile('topic', $json);
		$atlas_dir = \think\facade\Filesystem::putFile('topic', $atlas);
		$data = [
			'png' => $png_dir,
			'json' => $json_dir,
			'atlas' => $atlas_dir,
			'date' => date('Y-m-d H:i:s'),
			'default' => ''
		];
		$id = Db::name('datas')->insertGetId($data);
		echo $id;
	}

	public function get_urls()
	{
		$id = $this->get('id');
		$data = Db::name('datas')->where('id', $id)->find();
		if ($data) {
			$arr = [
				'errMsg' => 'ok',
				'data' => $data
			];
		} else {
			$arr = [
				'errMsg' => 'err'
			];
		}
		$this->outputJson($arr);
	}


	/**
	 * 获取数据
	 * @param $key 数据名称
	 * @param $must 布尔类型 是否是必须的参数
	 */
	private function get($key, $must = true)
	{
		// if (env('app_debug')) {
		//     /**
		//      * 在调试模式下使用get参数
		//      */
		//     return Request::get($key);
		// } else {
		$data = file_get_contents('php://input');
		// }
		$arr = json_decode($data, true);
		if ($must) {
			if (isset($arr[$key])) {
				return ($arr[$key]);
			} else {
				$res = [
					'code' => 0,
					'errMsg' => '缺少必要的参数 (' . $key . ')'
				];
				$this->outputJson($res);
			}
		} else {
			if (isset($arr[$key])) {
				return ($arr[$key]);
			} else {
				return null;
			}
		}
	}
	/**
	 * 将数组转换成JSON格式并输出
	 * @param $arr 数组
	 */
	private function outputJson($arr = [])
	{
		$json = json_encode($arr, JSON_UNESCAPED_UNICODE);
		echo $json;
		header('content-type:application/json');
		exit();
	}
}
