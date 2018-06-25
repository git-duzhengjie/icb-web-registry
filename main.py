# coding:utf-8
# python version:
# author: duzhengjie
# date: 2018/05/02
# description:镜像仓库ui
# ©成都爱车宝信息科技有限公司版权所有
from datetime import datetime
import json
import os.path
import subprocess
import traceback

import requests
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
from dateutil.tz import tz

from tornado.options import define, options

define("port", default=8080, help="run on the given port", type=int)
define("image_url", default="https://192.168.0.230:5000", help="image registry address", type=str)
define("version_path", default="./version.json", help="version path", type=str)


class BaseHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get_current_user(self):
        return self.get_secure_cookie("username")


class IndexHandler(BaseHandler):
    def get(self):
        tag_images = get_images()
        self.render('registry-web-base.html', tag_images=tag_images, user=self.current_user, online=get_online())


class TagsPageHandler(BaseHandler):
    def get(self, *args, **kwargs):
        arg = args[0]
        tags_time = get_images_tag(arg)
        self.render('registry-web-detail-base.html', tags_time=tags_time, image_name=arg, online=get_online(),
                    user=self.current_user)


class DeleteHandler(BaseHandler):
    def get(self, *args, **kwargs):
        arg = args[0]
        tag = self.get_argument("tag", None)
        if tag is None:
            command = "delete_docker_registry_image --image {0}".format(arg)
            print(command)
            subprocess.call(command, shell=True)
            self.redirect("/")
        else:
            command = "delete_docker_registry_image --image {0}:{1}".format(arg, tag)
            print(command)
            subprocess.call(command, shell=True)
            self.redirect("/tags/{0}".format(arg))


def get_current_version():
    with open(options.version_path) as f:
        return json.load(f)


def save_current_version(current_version):
    with open(options.version_path, 'w') as f:
        json.dump(current_version, f)


class PublishHandler(BaseHandler):
    def get(self, *args, **kwargs):
        arg = args[0]
        tag = self.get_argument("tag", None)
        args = arg.split('/')
        if len(args) > 1:
            srv = args[1]
        else:
            srv = args[0]
        current_version = get_current_version()
        if tag != current_version.get(srv):
            command = "kubectl set image deployment {0} {0}={1}/{2}:{3} -n icb " \
                .format(srv, options.image_url.replace("https://", ""), arg, tag)
            print(command)
            return_code = subprocess.call(command, shell=True)
            if return_code == 0:
                current_version[srv] = tag
                save_current_version(current_version)
            self.redirect("/tags/{0}".format(arg))
        else:
            command = "kubectl delete rs -l app={0} -n icb " \
                .format(srv)
            print(command)
            subprocess.call(command, shell=True)
            self.redirect("/tags/{0}".format(arg))


def check(username, password):
    with open('admin.json') as f:
        admin = json.load(f)
        if username in admin and admin[username] == password:
            return 0
        if username not in admin:
            return 1
        if username in admin and admin[username] != password:
            return 2


class SignInHandler(BaseHandler):
    def get(self, *args, **kwargs):
        self.render("sign-in.html")

    def post(self, *args, **kwargs):
        username = self.get_argument("username")
        password = self.get_argument("password")
        status = check(username, password)
        if status == 0:
            self.set_secure_cookie("username", username)
        self.write(str(status))

    def delete(self, *args, **kwargs):
        pass


class LogoutHandler(BaseHandler):
    def get(self, *args, **kwargs):
        self.clear_cookie("username")
        self.redirect("/")


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
            tags_time = []
            for tag in tags:
                tags_time.append({"tag": tag, "time": image_tag_time(image, tag)})
            tags_time = sorted(tags_time, key=lambda k: k["time"], reverse=True)
            images_tags.setdefault(image, tags_time)
        return images_tags
    except:
        traceback.print_exc()
        return None


def get_images_tag(image):
    try:
        url = options.image_url + "/v2/" + image + "/tags/list"
        result = requests.get(url, verify=False).content.strip()
        tags = json.loads(result).get('tags', [])
        tags_time = []
        for tag in tags:
            tags_time.append({"tag": tag, "time": image_tag_time(image, tag)})
        tags_time = sorted(tags_time, key=lambda k: k["time"], reverse=True)
        return tags_time
    except:
        traceback.print_exc()
        return None


def get_image_time(image, tags):
    try:
        url_base = options.image_url + "/v2/" + image + "/manifests/"
        create_time = {}
        for tag in tags:
            url = url_base + tag
            result = requests.get(url, verify=False).content.strip()
            create_time.setdefault(tag, get_local_time(
                json.loads(json.loads(result).get("history")[0].get("v1Compatibility"))
                .get("created")))
        return create_time
    except:
        return None


def get_image_last_time(image_tags):
    try:
        create_time = {}
        for image in image_tags:
            url_base = options.image_url + "/v2/" + image + "/manifests/"
            url = url_base + image_tags.get(image)[-1]
            result = requests.get(url, verify=False).content.strip()
            create_time.setdefault(image, get_local_time(
                json.loads(json.loads(result).get("history")[0].get("v1Compatibility"))
                .get("created")))
        return create_time
    except:
        return None


def image_tag_time(image, tag):
    try:
        url_base = options.image_url + "/v2/" + image + "/manifests/"
        url = url_base + tag
        result = requests.get(url, verify=False).content.strip()
        return get_local_time(
                json.loads(json.loads(result).get("history")[0].get("v1Compatibility"))
                .get("created"))
    except:
        return None


def get_normal_time(time):
    h, t = time.split('T')
    t = t.split('.')[0]
    return h + " " + t


def get_local_time(time):
    from_zone = tz.gettz('UTC')
    to_zone = tz.gettz('CST')
    utc = datetime.strptime(get_normal_time(time), '%Y-%m-%d %H:%M:%S')
    utc = utc.replace(tzinfo=from_zone)
    local = utc.astimezone(to_zone)
    return datetime.strftime(local, "%Y-%m-%d %H:%M:%S")


def get_online():
    with open(options.version_path) as f:
        return json.load(f)


if __name__ == '__main__':
    tornado.options.parse_command_line()
    app = tornado.web.Application(
        handlers=[(r'/', IndexHandler), (r'/tags/(.*)', TagsPageHandler), (r'/delete/(.*)', DeleteHandler),
                  (r'/sign-in', SignInHandler), (r'/logout', LogoutHandler),(r'/publish/(.*)', PublishHandler)
                  ],
        template_path=os.path.join(os.path.dirname(__file__), "html"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        debug=False,
        cookie_secret='sdfsjdkfjsdfsdf'
    )
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    print("listening on " + str(options.port))
    tornado.ioloop.IOLoop.instance().start()
