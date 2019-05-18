import json
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler
from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances
from numpy import array
from sklearn import preprocessing

from flask import Flask, render_template, request, redirect, Response, jsonify

#First of all you have to import it from the flask module:
app = Flask(__name__)
#By default, a route only answers to GET requests. You can use the methods argument of the route() decorator to handle different HTTP methods.
@app.route("/", methods = ['POST', 'GET'])
def index():
    #return the original cleaned dataframe to plot the dashboard
    if request.method == 'POST':
        if request.form['data'] == 'received':
             chart_data = us_map_df.to_dict(orient='records')
             area_pie_data = area_pie_df.to_dict(orient='records')
             crime_bar_data = crime_barchart_df.to_dict(orient='records')
             victim_trend_data = victim_trend_df.to_dict(orient='records')
             chart_data = json.dumps(chart_data, indent=2)
             area_pie_data = json.dumps(area_pie_data, indent=2)
             crime_bar_data = json.dumps(crime_bar_data, indent=2)
             age_agg = arrest_age_df[['Under 10', '10-18', '19-35','36-50', '51-65', 'Above 65']].sum(axis=0)
             age_df = pd.DataFrame({'Age':age_agg.index, 'Count':age_agg.values})
             age_data = age_df.to_dict(orient='records')
             age_data = json.dumps(age_data, indent=2)
             victim_trend_data = json.dumps(victim_trend_data, indent=2)
             data = {'chart_data': chart_data,'area_pie_data':area_pie_data, 'crime_bar_data':crime_bar_data, 'victim_trend_data': victim_trend_data, 'crime_by_age':age_data}
             return jsonify(data)
    return render_template("index.html")

@app.route("/crime", methods = ['POST'])
def crime_granular():
    #return the original cleaned dataframe to plot the dashboard
        crime_usa_map = orig_data.groupby(['id', 'State'])[request.form['data']].apply(
            lambda x: x.astype(int).sum()).reset_index()
        crime_area_pie = orig_data.groupby(['Area'])[request.form['data']].apply(
            lambda x: x.astype(int).sum()).reset_index()
        crime_area_pie.rename(columns={request.form['data']:'Total Crimes'}, inplace=True)
        crime_bar_chart = orig_data.groupby(['Year'])[request.form['data']].apply(
                lambda x: x.astype(int).sum()).reset_index()
        crime_bar_chart.rename(columns={request.form['data']:'Total Crimes'}, inplace=True)
        age_chart = arrest_age_df[arrest_age_df['Crime'] == request.form['data']]

        age_agg = age_chart[['Under 10', '10-18', '19-35','36-50', '51-65', 'Above 65']].sum(axis=0)
        age_df = pd.DataFrame({'Age':age_agg.index, 'Count':age_agg.values})

        chart_data = crime_usa_map.to_dict(orient='records')
        crime_area_pie = crime_area_pie.to_dict(orient='records')
        crime_bar_chart = crime_bar_chart.to_dict(orient='records')
        age_data = age_df.to_dict(orient='records')
        age_data = json.dumps(age_data, indent=2)
        chart_data = json.dumps(chart_data, indent=2)
        crime_area_pie = json.dumps(crime_area_pie, indent=2)
        crime_bar_chart = json.dumps(crime_bar_chart, indent=2)
        data = {'chart_data': chart_data,'area_pie_data':crime_area_pie,'crime_bar_data':crime_bar_chart, 'crime_by_age':age_data}
        return jsonify(data)

@app.route("/year", methods = ['POST'])
def year_granular():
    #return the original cleaned dataframe to plot the dashboard
        selected_years = request.form.getlist('years[]', type=int)
        copy_df = orig_data.copy(deep=True)
        age_copy_df = arrest_age_df.copy(deep=True)

        if len(selected_years) != 0:
            copy_df = copy_df[copy_df['Year'].isin(selected_years)] 
            age_copy_df = age_copy_df[age_copy_df['Year'].isin(selected_years)]


        us_map_year = copy_df.groupby(['id', 'State'])["Total Crimes", "Violent Crime"].apply(
            lambda x: x.astype(int).sum()).reset_index()
        area_pie_year = copy_df.groupby(['Area'])["Total Crimes"].apply(
            lambda x: x.astype(int).sum()).reset_index()
        print(area_pie_year)
        crime_barchart_year = orig_data.groupby(['Year'])["Total Crimes"].apply(
            lambda x: x.astype(int).sum()).reset_index() 

        chart_data = us_map_year.to_dict(orient='records')
        area_pie_data = area_pie_year.to_dict(orient='records')
        crime_bar_data = crime_barchart_year.to_dict(orient='records')
        chart_data = json.dumps(chart_data, indent=2)
        area_pie_data = json.dumps(area_pie_data, indent=2)
        crime_bar_data = json.dumps(crime_bar_data, indent=2)
        age_agg = age_copy_df[['Under 10', '10-18', '19-35','36-50', '51-65', 'Above 65']].sum(axis=0)
        age_df = pd.DataFrame({'Age':age_agg.index, 'Count':age_agg.values})
        age_data = age_df.to_dict(orient='records')
        age_data = json.dumps(age_data, indent=2)
        data = {'chart_data': chart_data,'area_pie_data':area_pie_data, 'crime_bar_data':crime_bar_data, 'crime_by_age':age_data}
        return jsonify(data)

@app.route("/year_crime", methods = ['POST'])
def year_crime_granular():
    #return the original cleaned dataframe to plot the dashboard
        selected_years = request.form.getlist('years[]', type=int)
        crime = request.form['crime']
        copy_df = orig_data.copy(deep=True)
        age_copy_df = arrest_age_df.copy(deep=True)

        if len(selected_years) != 0:
            copy_df = copy_df[copy_df['Year'].isin(selected_years)]
            age_copy_df = age_copy_df[age_copy_df['Year'].isin(selected_years)]

        print(crime == "Crime Category")

        if crime in ("" , "Crime Category", "success"):
            us_map_year = copy_df.groupby(['id', 'State'])["Total Crimes", "Violent Crime"].apply(
                lambda x: x.astype(int).sum()).reset_index()
            crime_area_pie = copy_df.groupby(['Area'])["Total Crimes"].apply(
                lambda x: x.astype(int).sum()).reset_index()
            crime_bar_chart = orig_data.groupby(['Year'])["Total Crimes"].apply(
                lambda x: x.astype(int).sum()).reset_index()
        else:
            crime_usa_map = copy_df.groupby(['id', 'State'])[crime].apply(
            lambda x: x.astype(int).sum()).reset_index()
            crime_area_pie = copy_df.groupby(['Area'])[crime].apply(
                lambda x: x.astype(int).sum()).reset_index()
            crime_area_pie.rename(columns={crime:'Total Crimes'}, inplace=True)
            crime_bar_chart = orig_data.groupby(['Year'])[crime].apply(
                lambda x: x.astype(int).sum()).reset_index()
            crime_bar_chart.rename(columns={crime:'Total Crimes'}, inplace=True)
            age_chart = age_copy_df[age_copy_df['Crime'] == crime]

        age_agg = age_chart[['Under 10', '10-18', '19-35','36-50', '51-65', 'Above 65']].sum(axis=0)
        age_df = pd.DataFrame({'Age':age_agg.index, 'Count':age_agg.values})

        chart_data = crime_usa_map.to_dict(orient='records')
        crime_area_pie = crime_area_pie.to_dict(orient='records')
        crime_bar_chart = crime_bar_chart.to_dict(orient='records')
        age_data = age_df.to_dict(orient='records')
        age_data = json.dumps(age_data, indent=2)
        chart_data = json.dumps(chart_data, indent=2)
        crime_area_pie = json.dumps(crime_area_pie, indent=2)
        crime_bar_chart = json.dumps(crime_bar_chart, indent=2)
        data = {'chart_data': chart_data,'area_pie_data':crime_area_pie,'crime_bar_data':crime_bar_chart, 'crime_by_age':age_data}
        return jsonify(data)

@app.route("/year_crime_map", methods = ['POST'])
def year_crime_map_granular():
    #return the original cleaned dataframe to plot the dashboard
        selected_years = request.form.getlist('years[]', type=int)
        selected_states = request.form.getlist('states[]', type=int)
        selected_areas = request.form.getlist('areas[]')

        crime = request.form['crime']
        print(crime)
        copy_df = orig_data.copy(deep=True)
        crime_bar_copy_df = orig_data.copy(deep=True)
        age_copy_df = arrest_age_df.copy(deep=True)
        pie_copy_df = orig_data.copy(deep=True)

        if len(selected_years) != 0:
            copy_df = copy_df[copy_df['Year'].isin(selected_years)]
            age_copy_df = age_copy_df[age_copy_df['Year'].isin(selected_years)]
            pie_copy_df = pie_copy_df[pie_copy_df['Year'].isin(selected_years)]

        if len(selected_areas) !=0:
            copy_df = copy_df[copy_df['Area'].isin(selected_areas)]
            crime_bar_copy_df = crime_bar_copy_df[crime_bar_copy_df['Area'].isin(selected_areas)]


        if crime in ("" , "Crime Category", "success"):
            crime_usa_map = copy_df.groupby(['id', 'State'])["Total Crimes", "Violent Crime"].apply(
                lambda x: x.astype(int).sum()).reset_index()
        else:
            crime_usa_map = copy_df.groupby(['id', 'State'])[crime].apply(
            lambda x: x.astype(int).sum()).reset_index()

        if len(selected_states) != 0:
            copy_df = copy_df[copy_df['id'].isin(selected_states)]
            crime_bar_copy_df = crime_bar_copy_df[crime_bar_copy_df['id'].isin(selected_states)]
            pie_copy_df = pie_copy_df[pie_copy_df['id'].isin(selected_states)]

        print(copy_df)
  
        if crime in ("" , "Crime Category", "success"):
            crime_area_pie = pie_copy_df.groupby(['Area'])["Total Crimes","Area Population"].apply(
                lambda x: x.astype(int).sum()).reset_index()
            crime_bar_chart = crime_bar_copy_df.groupby(['Year'])["Total Crimes"].apply(
                lambda x: x.astype(int).sum()).reset_index()
        else:
            crime_area_pie = pie_copy_df.groupby(['Area'])[crime,"Area Population"].apply(
                lambda x: x.astype(int).sum()).reset_index()
            crime_area_pie.rename(columns={crime:'Total Crimes'}, inplace=True)
            crime_bar_chart = crime_bar_copy_df.groupby(['Year'])[crime].apply(
                lambda x: x.astype(int).sum()).reset_index()
            crime_bar_chart.rename(columns={crime:'Total Crimes'}, inplace=True)
            age_copy_df = age_copy_df[age_copy_df['Crime'] == crime]

        age_agg = age_copy_df[['Under 10', '10-18', '19-35','36-50', '51-65', 'Above 65']].sum(axis=0)
        age_df = pd.DataFrame({'Age':age_agg.index, 'Count':age_agg.values})

        chart_data = crime_usa_map.to_dict(orient='records')
        crime_area_pie = crime_area_pie.to_dict(orient='records')
        crime_bar_chart = crime_bar_chart.to_dict(orient='records')
        age_data = age_df.to_dict(orient='records')
        age_data = json.dumps(age_data, indent=2)
        chart_data = json.dumps(chart_data, indent=2)
        crime_area_pie = json.dumps(crime_area_pie, indent=2)
        crime_bar_chart = json.dumps(crime_bar_chart, indent=2)
        data = {'chart_data': chart_data,'area_pie_data':crime_area_pie,'crime_bar_data':crime_bar_chart, 'crime_by_age':age_data}
        return jsonify(data)


#Task 3 Part 1 - Plots the 2D scatter plot for all 3 dataset of top 2 PCA vectors
@app.route("/pca_scatter", methods = ['POST', 'GET'])
def pca_scatter():
    global stratified_sampled_data
    global scaled_df
    global random_sampled_data

    pca = PCA(n_components = 2)

    if request.method == 'POST':
        if request.form['data'] == 'random':
            pca_transform = pca.fit_transform(random_sampled_data)
            data = pd.DataFrame(pca_transform, columns = ['component1','component2'])
            chart_data = data.to_dict(orient='records')
            chart_data = json.dumps(chart_data, indent=2)
            data = {'chart_data': chart_data}
            return jsonify(data) # Should be a json string
        elif request.form['data'] == 'stratified':
                pca_transform = pca.fit_transform(stratified_sampled_data)
                data = pd.DataFrame(pca_transform, columns = ['component1','component2'])
                chart_data = data.to_dict(orient='records')
                chart_data = json.dumps(chart_data, indent=2)
                data = {'chart_data': chart_data}
                return jsonify(data) # Should be a json string
        else:
            pca_transform = pca.fit_transform(scaled_df)
            data = pd.DataFrame(pca_transform, columns=['component1', 'component2'])
            chart_data = data.to_dict(orient='records')
            chart_data = json.dumps(chart_data, indent=2)
            data = {'chart_data': chart_data}
            return jsonify(data)  # Should be a json string

@app.route("/pca", methods = ['POST', 'GET'])
def pca():
    global variance
    global sum_sqaured_loading
    global scaled_df
    global features_list

    indices = list(range(1, 13))
    zip_list = list(zip(indices, variance,sum_sqaured_loading,features_list))
    data = pd.DataFrame(zip_list, columns = ['pca_component' , 'eigen_values','sum_sqaured_loadings','features_name'])

    if request.method == 'POST':
        if request.form['data'] == 'received':
             chart_data = data.to_dict(orient='records')
             chart_data = json.dumps(chart_data, indent=2)
             data = {'chart_data': chart_data}
             return jsonify(data)
    return ""

#returns eigen values and loadings
def get_pca_parameters(data):
    pca = PCA()
    pca.fit_transform(data)
    return pca.explained_variance_ , pca.components_

#cleans the dataset for PCA
def clean_dataset():
    global df_pca
    df_pca.drop('State', axis = 1, inplace=True)
    df_pca.drop('Area', axis = 1, inplace=True)
    df_pca.drop('code', axis = 1, inplace=True)
    df_pca.drop('id', axis = 1, inplace=True)

    df_pca.drop('Year', axis = 1, inplace=True)
    #df_pca.drop('State Population', axis = 1, inplace=True)
    #df_pca.drop('Area Population', axis = 1, inplace=True)
    df_pca.drop('Total Crimes', axis = 1, inplace=True)
    df_pca.drop('Violent Crime', axis = 1, inplace=True)

#method to normalise the data using MaxMinScaler
def get_scaled_data():
    global scaled_df
    global df_pca
    # Scaling the data to perform PCA USing MinMaxScaler to scale all features in range of 0-1
    columns = df_pca.columns
    scaler = MinMaxScaler()
    scaled_df = scaler.fit_transform(df_pca)
    scaled_df = pd.DataFrame(scaled_df, columns=columns)

#TASK 2 - Computing squared sum loadings to find three attributes with highest loaded PCA attributes
def get_sqaured_sum_loadings(data,k):
    features = len(data)
    sqaured_loadings = []
    for pci in range(0,features):
        sq_load = 0
        for j in range(0,k):
            sq_load += data[j][pci] * data[j][pci]
        sqaured_loadings.append(sq_load)
    return sqaured_loadings

#TASK 2 - returns top attributes with higest squared sum loadings
def print_table_loadings(loading,sum_sqaured_loading):
    features = range(1,len(sum_sqaured_loading)+1)
    a = array(features)
    b = array(loading)
    c = array(sum_sqaured_loading)
    result = array(list(zip(a,b[0,:],b[1,:],b[2,:],b[3,:],c)))
    result_list = result.tolist()
    result_list = sorted(result_list, key=lambda l: l[5], reverse=True)

    # print('Table to show sum of squared loadings\n')
    # for row in result_list:
    #     print(' '.join([str(elem) for elem in row]))
    return [int(i[0]) for i in result_list]

if __name__ == "__main__":
    global ROBBERY_CRIME
    ROBBERY_CRIME = 'Robbery'
    global us_map_df, scaled_df, df_pca, area_pie_df, crime_barchart_df, victim_trend_df, arrest_age_df
    orig_data = pd.read_csv('data/crime-dataset-final.csv')
    arrest_age_df = pd.read_csv('data/criminal-by-age.csv')
    arrest_age_df.rename(columns={'Under 10':'Under 10',
                          '10 to 18':'10-18',
                          '19 to 35':'19-35',
                           '36 - 50':'36-50',
                 '51 to 65':'51-65',
                 'Above 66':'Above 65'}, 
                 inplace=True)

    victim_trend_df = pd.read_csv('data/victim_trend.csv')
    df_pca = orig_data.copy(deep=True)

    us_map_df = orig_data.groupby(['id', 'State'])["Total Crimes", "Violent Crime"].apply(
        lambda x: x.astype(int).sum()).reset_index()
    area_pie_df = orig_data.groupby(['Area'])["Total Crimes", "Area Population"].apply(
        lambda x: x.astype(int).sum()).reset_index()
    print(area_pie_df);
    crime_barchart_df = orig_data.groupby(['Year'])["Total Crimes"].apply(
        lambda x: x.astype(int).sum()).reset_index()
    crime_barchart_df.Year = crime_barchart_df.Year.astype(str)
    victim_trend_df.Year = victim_trend_df.Year.astype(str)
    clean_dataset()
    #dataframe to store normalized data
    scaled_df = pd.DataFrame()

    get_scaled_data()

    variance, loading  = get_pca_parameters(scaled_df)
    #Finding Sum of Squared Loadings to get the 3 attributes with highest PCA loadings for stratified sampled data
    sum_sqaured_loading = get_sqaured_sum_loadings(loading,len(loading))
    #printing table of top attributes with highest loadings
    top_features = print_table_loadings(loading,sum_sqaured_loading)

    features_list = list(scaled_df.columns.values)
    print("Top 3 features with highest PCA loadings - ", features_list[top_features[0]-1], ', ',features_list[top_features[1]-1], ', ',features_list[top_features[2]-1])

    app.run(debug=True)
