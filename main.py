# coding:utf-8
# python version:
# author: duzhengjie
# date: 2018/05/02
# description:镜像仓库ui
# ©成都爱车宝信息科技有限公司版权所有
import json
import os.path
import traceback

import requests
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

from tornado.options import define, options

define("port", default=8080, help="run on the given port", type=int)


class IndexHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self):
        tag_images = get_images()
        self.render('registry-web-base.html', tag_images=tag_images)


class TagsPageHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, *args, **kwargs):
        arg = args[0]
        tag_images = get_images()
        self.render('registry-web-detail-base.html', tags=tag_images.get(arg, []), image_name=arg)


class DeleteHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, *args, **kwargs):
        arg = args[0]
        tag_images = get_images()
        self.render('registry-web-detail-base.html', tags=tag_images.get(arg, []), image_name=arg)


def get_images():
    try:
        url = "https://220.167.101.47:5000/v2/_catalog"
        result = requests.get(url, verify=False).content.strip()
        docker_images = json.loads(result).get("repositories")
        images_tags = {}
        for image in docker_images:
            url = "https://220.167.101.47:5000/v2/" + image + "/tags/list"
            result = requests.get(url, verify=False).content.strip()
            tags = json.loads(result).get('tags', [])
            images_tags.setdefault(image, tags)
        return images_tags
    except:
        traceback.print_exc()
        return None


if __name__ == '__main__':
    tornado.options.parse_command_line()
    app = tornado.web.Application(
        handlers=[(r'/', IndexHandler), (r'/tags/(.*)', TagsPageHandler), (r'delete/(.*)', DeleteHandler)],
        template_path=os.path.join(os.path.dirname(__file__), "html"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        debug=True
    )
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    print("listening on " + str(options.port))
    tornado.ioloop.IOLoop.instance().start()
