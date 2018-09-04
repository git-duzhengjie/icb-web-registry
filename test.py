# coding:utf-8
# python version:
# author: duzhengjie
# date: 2018/7/27 8:57
# description:

# ©成都爱车宝信息科技有限公司版权所有
from requests import options

from main import get_images


def test():
    options.image_url = "https://121.43.162.235:5000"
    tag_images, page_count = get_images(0, 45)
    print(type(tag_images))
    base = """{% for i in range(len(tag_images)) %}
                        <a href="tags/{{list(tag_images.keys())[i]}}"><tr>
                            <td>{{i}}</td>
                            <td>
                                <a href="/tags/{{list(tag_images.keys())[i]}}">{{list(tag_images.keys())[i]}}
                                    {% if (len(list(tag_images.keys())[i].split('/')) == 2 and
                                    list(tag_images.keys())[i].split('/')[1] in online) or  list(tag_images.keys())[i] in online %}
                                    <sup id="online"><font color="green">k8s</font></sup></a>
                                    {% end %}
                                </td>
                            <td>{{len(tag_images.get(list(tag_images.keys())[i]))}}</td>
                            <td>{{tag_images.get(list(tag_images.keys())[i])[0].get("tag")}}</td>
                            <td class="col-6">{{tag_images.get(list(tag_images.keys())[i])[0].get("time")}}</td>
                            {%if user is not None%}
                            <td class="del"><a href="JavaScript:void(0)" rel="/delete/{{list(tag_images.keys())[i]}}">删除</a></td>
                            {% end %}
                        </tr>
                        </a>
                      {% end %}"""
    for i in range(len(tag_images)):
        print(tag_images.get(list(tag_images.keys())[i]), list(tag_images.keys())[i])
    # t = template.Template(base)
    # return t.generate(tag_images=tag_images, online=get_online(), user=None)

test()
