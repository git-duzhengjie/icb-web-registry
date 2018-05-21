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
define("image_url", default="https://192.168.0.230:5000", help="image registry address", type=str)


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


class SignInHandler(tornado.web.RequestHandler):

    def data_received(self, chunk):
        pass

    def get(self, *args, **kwargs):
        self.render("sign-in.html")

    def post(self, *args, **kwargs):
        self.set_secure_cookie("username", self.get_argument("username"))
        self.redirect("/")


class BaseHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get_current_user(self):
        return self.get_secure_cookie("username")


def sort(tags):
    sort_tags = tags
    if 'latest' in tags:
        tags.remove('latest')
        sort_tags = sorted(tags)
        sort_tags.append("latest")
    return sort_tags


def get_images():
    try:
        url = options.image_url + "/v2/_catalog"
        result = requests.get(url, verify=False).content.strip()
        docker_images = json.loads(result).get("repositories")
        images_tags = {}
        for image in docker_images:
            url = options.image_url + "/v2/" + image + "/tags/list"
            result = requests.get(url, verify=False).content.strip()
            tags = json.loads(result).get('tags', [])
            tags = sort(tags)
            images_tags.setdefault(image, tags)
        return images_tags
    except:
        traceback.print_exc()
        return None


if __name__ == '__main__':
    tornado.options.parse_command_line()
    app = tornado.web.Application(
        handlers=[(r'/', IndexHandler), (r'/tags/(.*)', TagsPageHandler), (r'delete/(.*)', DeleteHandler),
                  (r'/sign-in', SignInHandler)],
        template_path=os.path.join(os.path.dirname(__file__), "html"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        debug=True
    )
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    print("listening on " + str(options.port))
    tornado.ioloop.IOLoop.instance().start()
