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
		$key = input('key');
		if ($key) {
			$datas = Db::name('datas')->where('pid', $key)->find();
			if ($datas) {
				$json = $datas['json'];
				$png = $datas['png'];
				$atlas = $datas['atlas'];
				View::assign('json', Request::domain() . '/storage/' .   str_replace('\\', '/', $json));
				View::assign('png',  Request::domain() . '/storage/' .  str_replace('\\', '/', $png));
				View::assign('atlas', Request::domain() . '/storage/' . str_replace('\\', '/', $atlas));
				return View::fetch();
			} else {
				return redirect('/index/spine');
			}
		} else {
			return redirect('/index/spine');
		}
	}
	public function spine()
	{
		return View::fetch();
	}
	public function ske()
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
		$pid =  md5(time() . rand(1000, 9999));
		$data = [
			'png' => $png_dir,
			'json' => $json_dir,
			'atlas' => $atlas_dir,
			'date' => date('Y-m-d H:i:s'),
			'default' => '',
			'pid' => $pid
		];
		$res = Db::name('datas')->insert($data);
		if ($res) {
			return redirect('/index/complete?key=' . $pid);
		}
	}

	public function complete()
	{
		$key = input('key');
		View::assign('key', $key);
		View::assign('domain', Request::domain());
		return View::fetch();
	}


	public function viewer()
	{
		return View::fetch();
	}
}
